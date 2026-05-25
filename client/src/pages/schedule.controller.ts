import { Hono } from "hono";
import { protectUnitAndTypeCombo, requireLogin, validateData, validateParams, validateQuery } from "../middlewares/auth.middleware.js";
import {
    AddScheduleActivitySchema,
    AddScheduleSchema,
    AddScheduleStepSchema,
    AddScheduleStandardAssignmentSchema,
    ScheduleActivityParamSchema,
    ScheduleActivityQuerySchema,
    ScheduleActivityUpdateParamSchema,
    ScheduleParamSchema,
    ScheduleQueryAllSchema,
    ScheduleQuerySchema,
    ScheduleAssignmentParamSchema,
    ScheduleStepParamSchema,
    ScheduleStepQuerySchema,
    UpdateScheduleActivitySchema,
    UpdateScheduleSchema,
    UpdateScheduleStepSchema,
    ScheduleApprovalQuerySchema,
    AddScheduleApprovalDecisionSchema,
    ScheduleGetByYearQuery,
    ScheduleAssignmentsQuerySchema,
} from "../validations/schedule.validation.js";
import { ApprovalStatus, DocumentFinalType } from "../generated/prisma/index.js";
import type { FinalDocuments, Prisma, ScheduleActivities, Schedules, ScheduleSteps, Units, Standards } from "../generated/prisma/index.js";
import {
    addScheduleActivityService,
    addScheduleService,
    addScheduleStepService,
    countAllScheduleActivityService,
    countAllScheduleService,
    countAllScheduleStepService,
    deleteScheduleActivityService,
    deleteScheduleService,
    deleteScheduleStepService,
    editScheduleActivityService,
    editScheduleService,
    editScheduleStepService,
    getAllScheduleActivityService,
    getAllScheduleService,
    getAllScheduleStepListService,
    getAllScheduleStepService,
    getAllScheduleWhereService,
    getScheduleActivityWhereUniqueService,
    getScheduleStandardsService,
    getScheduleStepWhereUniqueService,
    getScheduleWhereUniqueService,
    getScheduleStandardAssignmentByIdService,
    deleteScheduleStandardAssignmentService,
    addScheduleStandardAssignmentService,
    countAllScheduleApprovalService,
    getAllScheduleApprovalService,
    getScheduleApprovalWhereUniqueService,
    addScheduleApprovalService,
    getScheduleByYearService,
    countAllScheduleStandardApprovalService,
    getAllScheduleStandardApprovalService,
    getScheduleStandardApprovalWhereUniqueService,
    addScheduleStandardApprovalService,
    getAllScheduleStandardAssignmentService,
    countAllScheduleStandardAssignmentsPaginationService,
    getScheduleStandardAssignmentsPaginationService,
    addPublicTestFromScheduleService,
} from "../services/schedule.service.js";
import {
    addAssignmentFinalDocumentService,
    createFinalDocumentService,
    getFinalDocumentByTypeAndIdService,
    updateFinalDocumentService,
} from "../services/final-document.service.js";
import { getAllActiveUnitsService, getAllActiveUsersWithUnitsService } from "../services/user.service.js";
import type {
    TSchduleWithRelations,
    TScheduleActivityWithOrderingNumber,
    TScheduleActivityWithRelations,
    TScheduleStandardAssignmentWithRelations,
    TScheduleAssignmentSummary,
    TScheduleStepWithOrderingNumber,
    TScheduleWithOrderingNumber,
    TScheduleApprovalListWithOrderingNumber,
    TScheduleApprovalList,
    TScheduleWithApprovalRequest,
    TApprovalStepsWhereUniqueIncludeWithDecisionStatus,
    TApprovalStepsStandardWhereUniqueIncludeWithDecisionStatus,
    TScheduleStandardFormulatorMaping,
    TAssignmentMember,
    TAssignmentUnit,
    TScheduleAssignmentSummaryWithOrderingNumber,
} from "../types/schedule.js";
import type { TAssignmentUserOption } from "../types/user.js";
import type { Pagination } from "../types/pagination.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/api-response.js";
import { REK_ONLY, SAM_WITH_PPM_UNIT } from "../configs/protect-role.config.js";
import { generateScheduleActivitiesPdf, generateStandardFormulatorPdf } from "../utils/pdf.js";
import { deleteLocalFileByUrl, saveLocalFile } from "../utils/storage.js";
import { getStandardWhereUniqueService } from "../services/standard.service.js";
import { FailedError, NotFoundError } from "../utils/error.js";
import { DEFAULT_STAGES, type STAGES } from "../types/stages.js";
import { describeRoute } from "hono-openapi";

const scheduleRouter = new Hono();

const mapAssignmentToSummary = (assignment: TScheduleStandardAssignmentWithRelations): TScheduleAssignmentSummary => {
    const leadMember: TScheduleStandardAssignmentWithRelations["assignmentMembers"][number] | undefined = assignment.assignmentMembers.find(
        (member: TScheduleStandardAssignmentWithRelations["assignmentMembers"][number]): boolean => member.memberType === "KETUA",
    );
    const otherMembers: TScheduleStandardAssignmentWithRelations["assignmentMembers"] = assignment.assignmentMembers.filter(
        (member: TScheduleStandardAssignmentWithRelations["assignmentMembers"][number]): boolean => member.memberType !== "KETUA",
    );
    const hashApprovalRequest: TScheduleStandardAssignmentWithRelations["currentApprovalRequest"] = assignment.currentApprovalRequest;

    return {
        idScheduleStandardAssignment: assignment.idScheduleStandardAssignment,
        standardName: assignment.scheduleStandard.standard.standardName,
        standardCode: assignment.scheduleStandard.standard.standardCode,
        templateDetail: assignment.templateStandards?.detailContent ?? null,
        lead: leadMember
            ? {
                idUser: leadMember.user.idUser,
                name: leadMember.user.fullName ?? leadMember.user.name,
                memberType: leadMember.memberType,
            }
            : null,
        members: otherMembers.map(
            (member: TScheduleStandardAssignmentWithRelations["assignmentMembers"][number]): TAssignmentMember => ({
                idUser: member.user.idUser,
                name: member.user.fullName ?? member.user.name,
                memberType: member.memberType,
            }),
        ),
        units: assignment.assignmentUnits.map(
            (assignmentUnit: TScheduleStandardAssignmentWithRelations["assignmentUnits"][number]): TAssignmentUnit => ({
                idUnit: assignmentUnit.unit.idUnit,
                unitName: assignmentUnit.unit.unitName,
            }),
        ),
        currentApprovalRequest: hashApprovalRequest,
    };
};

// Schedule Standard Approval
scheduleRouter.get(
    "/approval/standard",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get all schedule standard approval',
            }
        },
        summary: "Get all schedule standard approval"
    }),
    protectUnitAndTypeCombo(REK_ONLY),
    validateQuery(ScheduleApprovalQuerySchema),
    async (c): Promise<void | Response> => {
        const idUser: string = c.get("idUser");
        const { page: pPage, limit: pLimit, sortBy, scheduleCode, scheduleName, scheduleYear, isActive } = c.req.valid("query");
        const where: Prisma.ApprovalStepsWhereInput[] = [];
        let orderBy: Prisma.ApprovalStepsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (scheduleCode) {
            where.push({
                request: {
                    currentForSchedule: {
                        scheduleCode: {
                            contains: scheduleCode.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                },
            });
        }

        if (scheduleName) {
            where.push({
                request: {
                    currentForSchedule: {
                        scheduleName: {
                            contains: scheduleName.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                },
            });
        }

        if (scheduleYear) {
            where.push({
                request: {
                    currentForSchedule: {
                        scheduleYear: Number(scheduleYear),
                    },
                },
            });
        }

        if (isActive) {
            where.push({
                request: {
                    isActive: isActive === "true",
                },
            });
        }

        if (sortBy) {
            if (Array.isArray(sortBy)) {
                sortBy.forEach((sort: string): void => {
                    if (typeof sort === "string") {
                        const [key, valueRaw = "asc"] = sort.split(":");
                        const value = valueRaw === "asc" ? "asc" : "desc";
                        const sortValue = value as "asc" | "desc";
                        orderBy.push({ [key]: sortValue });
                    }
                });
            }
        }

        const [total, total_filtered, dataApproval] = await Promise.all([
            countAllScheduleStandardApprovalService(idUser),
            countAllScheduleStandardApprovalService(idUser, { where }),
            getAllScheduleStandardApprovalService(idUser, where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TScheduleApprovalListWithOrderingNumber[] = dataApproval.map(
            (item: TScheduleApprovalList, index: number): TScheduleApprovalListWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TScheduleApprovalListWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TScheduleApprovalListWithOrderingNumber>>(
            c,
            200,
            data,
            "Successfully get all schedule standard approval",
        );
    },
);

scheduleRouter.get(
    "/approval/standard/:idSchedule",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get schedule standard approval',
            }
        },
        summary: "Get schedule standard approval"
    }),
    protectUnitAndTypeCombo(REK_ONLY),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const scheduleApproval: TApprovalStepsStandardWhereUniqueIncludeWithDecisionStatus | null =
            await getScheduleStandardApprovalWhereUniqueService(idSchedule, idUser);

        if (!scheduleApproval) {
            return sendErrorResponse(c, 404, "Schedule standard approval not found");
        }

        return sendSuccessResponse<TApprovalStepsStandardWhereUniqueIncludeWithDecisionStatus>(
            c,
            200,
            scheduleApproval,
            "Successfully get schedule standard approval",
        );
    },
);

scheduleRouter.post(
    "/approval/standard/:idSchedule",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            201: {
                description: 'Successfully Add Schedule Standard Approval',
            }
        },
        summary: "Add Schedule Standard Approval"
    }),
    protectUnitAndTypeCombo(REK_ONLY),
    validateParams(ScheduleParamSchema),
    validateData(AddScheduleApprovalDecisionSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const { note, status } = c.req.valid("json");

        try {
            const approve: boolean = await addScheduleStandardApprovalService(idSchedule, idUser, {
                note,
                status,
            });

            if (!approve) {
                return sendErrorResponse(c, 500, "Failed to approve schedule standard");
            }
            // TODO: Send Email OR Whatsapp to whose created the schedule
            return sendSuccessResponse(c, 201, null, "Successfully make decision for schedule standard");
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendErrorResponse(c, 404, error.message);
            }
            if (error instanceof FailedError) {
                return sendErrorResponse(c, 400, error.message);
            }
            return sendErrorResponse(c, 500, "Failed to approve schedule standard");
        }
    },
);

// Schedule Approval Step
scheduleRouter.get(
    "/approval",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get All Schedule Approval',
            }
        },
        summary: "Get All Schedule Approval"
    }),
    protectUnitAndTypeCombo(REK_ONLY),
    validateQuery(ScheduleApprovalQuerySchema),
    async (c): Promise<void | Response> => {
        const idUser: string = c.get("idUser");
        const { page: pPage, limit: pLimit, sortBy, scheduleCode, scheduleName, scheduleYear, isActive } = c.req.valid("query");
        const where: Prisma.ApprovalStepsWhereInput[] = [];
        let orderBy: Prisma.ApprovalStepsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (scheduleCode) {
            where.push({
                request: {
                    currentForSchedule: {
                        scheduleCode: {
                            contains: scheduleCode.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                },
            });
        }

        if (scheduleName) {
            where.push({
                request: {
                    currentForSchedule: {
                        scheduleName: {
                            contains: scheduleName.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                },
            });
        }

        if (scheduleYear) {
            where.push({
                request: {
                    currentForSchedule: {
                        scheduleYear: Number(scheduleYear),
                    },
                },
            });
        }

        if (isActive) {
            where.push({
                request: {
                    isActive: isActive === "true",
                },
            });
        }

        if (sortBy) {
            if (Array.isArray(sortBy)) {
                sortBy.forEach((sort: string): void => {
                    if (typeof sort === "string") {
                        const [key, valueRaw = "asc"] = sort.split(":");
                        const value = valueRaw === "asc" ? "asc" : "desc";
                        const sortValue = value as "asc" | "desc";
                        orderBy.push({ [key]: sortValue });
                    }
                });
            }
        }

        const [total, total_filtered, dataApproval] = await Promise.all([
            countAllScheduleApprovalService(idUser),
            countAllScheduleApprovalService(idUser, { where }),
            getAllScheduleApprovalService(idUser, where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TScheduleApprovalListWithOrderingNumber[] = dataApproval.map(
            (item: TScheduleApprovalList, index: number): TScheduleApprovalListWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TScheduleApprovalListWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TScheduleApprovalListWithOrderingNumber>>(
            c,
            200,
            data,
            "Successfully get all schedule approval",
        );
    },
);

scheduleRouter.get(
    "/approval/:idSchedule",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Schedule Approval',
            }
        },
        summary: "Get Schedule Approval"
    }),
    protectUnitAndTypeCombo(REK_ONLY),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const scheduleApproval: TApprovalStepsWhereUniqueIncludeWithDecisionStatus | null = await getScheduleApprovalWhereUniqueService(
            idSchedule,
            idUser,
        );

        if (!scheduleApproval) {
            return sendErrorResponse(c, 404, "Schedule approval not found");
        }

        return sendSuccessResponse<TApprovalStepsWhereUniqueIncludeWithDecisionStatus>(
            c,
            200,
            scheduleApproval,
            "Successfully get schedule approval",
        );
    },
);

scheduleRouter.post(
    "/approval/:idSchedule",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            201: {
                description: 'Successfully Add Schedule Standard Approval',
            }
        },
        summary: "Add Schedule Standard Approval"
    }),
    protectUnitAndTypeCombo(REK_ONLY),
    validateParams(ScheduleParamSchema),
    validateData(AddScheduleApprovalDecisionSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const { note, status } = c.req.valid("json");

        try {
            const approve: boolean = await addScheduleApprovalService(idSchedule, idUser, {
                note,
                status,
            });

            if (!approve) {
                return sendErrorResponse(c, 500, "Failed to approve schedule");
            }
            // TODO: Send Email OR Whatsapp to whose created the schedule
            return sendSuccessResponse(c, 201, null, "Successfully make decision for schedule");
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendErrorResponse(c, 404, error.message);
            }
            if (error instanceof FailedError) {
                return sendErrorResponse(c, 400, error.message);
            }
            return sendErrorResponse(c, 500, "Failed to approve schedule");
        }
    },
);

// Schedule Assignment
scheduleRouter.get(
    "/assignment/resources",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Assignment Resource',
            }
        },
        summary: "Get Assignment Resource"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    async (c): Promise<void | Response> => {
        const [users, units, standards] = await Promise.all([
            getAllActiveUsersWithUnitsService(),
            getAllActiveUnitsService(),
            getScheduleStandardsService(),
        ]);

        const formattedUnits = units.map((unit: Units) => ({
            idUnit: unit.idUnit,
            unitName: unit.unitName,
            unitCode: unit.unitCode,
        }));

        const formattedStandards = standards.map((standard: Standards) => ({
            idStandard: standard.idStandard,
            standardName: standard.standardName,
            standardCode: standard.standardCode,
        }));

        return sendSuccessResponse<{
            users: TAssignmentUserOption[];
            units: {
                idUnit: string;
                unitName: string;
                unitCode: string;
            }[];
            standards: {
                idStandard: string;
                standardName: string;
                standardCode: string;
            }[];
        }>(
            c,
            200,
            {
                users,
                units: formattedUnits,
                standards: formattedStandards,
            },
            "Successfully get assignment resources",
        );
    },
);

// Schedule Step Management
scheduleRouter.get(
    "/schedule-step",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get All Schedule Step',
            }
        },
        summary: "Get All Schedule Step"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateQuery(ScheduleStepQuerySchema),
    async (c): Promise<void | Response> => {
        const { page: pPage, limit: pLimit, sortBy, scheduleStepName, scheduleStepCode, isActive } = c.req.valid("query");
        const where: Prisma.ScheduleStepsWhereInput[] = [];
        let orderBy: Prisma.ScheduleStepsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (scheduleStepName) {
            where.push({
                scheduleStepName: {
                    contains: scheduleStepName.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }

        if (scheduleStepCode) {
            where.push({
                scheduleStepCode: {
                    contains: scheduleStepCode.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }

        if (isActive) {
            where.push({
                isActive: isActive === "true",
            });
        }

        if (sortBy) {
            if (Array.isArray(sortBy)) {
                sortBy.forEach((sort: string): void => {
                    if (typeof sort === "string") {
                        const [key, valueRaw = "asc"] = sort.split(":");
                        const value = valueRaw === "asc" ? "asc" : "desc";
                        const sortValue = value as "asc" | "desc";
                        orderBy.push({ [key]: sortValue });
                    }
                });
            }
        }

        const [total, total_filtered, dataScheduleStep] = await Promise.all([
            countAllScheduleStepService(),
            countAllScheduleStepService({ where }),
            getAllScheduleStepService(where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TScheduleStepWithOrderingNumber[] = dataScheduleStep.map(
            (item: ScheduleSteps, index: number): TScheduleStepWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TScheduleStepWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TScheduleStepWithOrderingNumber>>(c, 200, data, "Successfully get all schedule step");
    },
);

scheduleRouter.get(
    "/schedule-step/lists",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get lsit Schedule Step',
            }
        },
        summary: "Get lsit Schedule Step"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    async (c): Promise<void | Response> => {
        const existingScheduleStep: ScheduleSteps[] = await getAllScheduleStepListService();
        return sendSuccessResponse<ScheduleSteps[]>(c, 200, existingScheduleStep, "Successfully get lsit schedule step");
    },
);

scheduleRouter.post(
    "/schedule-step",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            201: {
                description: 'Successfully Add Schedule Step',
            }
        },
        summary: "Add Schedule Step"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateData(AddScheduleStepSchema),
    async (c): Promise<void | Response> => {
        const { scheduleStepName, scheduleStepCode } = c.req.valid("json");
        const scheduleStep: ScheduleSteps = await addScheduleStepService({
            scheduleStepName,
            scheduleStepCode,
        });
        return sendSuccessResponse<ScheduleSteps>(c, 201, scheduleStep, "Successfully add schedule step");
    },
);

scheduleRouter.get(
    "/schedule-step/:idScheduleStep",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Schedule Step',
            }
        },
        summary: "Get Schedule Step"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleStepParamSchema),
    async (c): Promise<void | Response> => {
        const { idScheduleStep } = c.req.valid("param");
        const existingScheduleStep: ScheduleSteps | null = await getScheduleStepWhereUniqueService({ idScheduleStep });
        if (!existingScheduleStep) {
            return sendErrorResponse(c, 404, "Schedule step not found");
        }
        return sendSuccessResponse<ScheduleSteps>(c, 200, existingScheduleStep, "Successfully get schedule step");
    },
);

scheduleRouter.delete(
    "/schedule-step/:idScheduleStep",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Delete Schedule Step',
            }
        },
        summary: "Delete Schedule Step"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleStepParamSchema),
    async (c): Promise<void | Response> => {
        const { idScheduleStep } = c.req.valid("param");
        const existingScheduleStep: ScheduleSteps | null = await getScheduleStepWhereUniqueService({ idScheduleStep });
        if (!existingScheduleStep) {
            return sendErrorResponse(c, 404, "Schedule step not found");
        }
        const scheduleStep: ScheduleSteps = await deleteScheduleStepService({ idScheduleStep });
        return sendSuccessResponse<ScheduleSteps>(c, 200, scheduleStep, "Successfully delete schedule step");
    },
);

scheduleRouter.patch(
    "/schedule-step/:idScheduleStep",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Update Schedule Step',
            }
        },
        summary: "Update Schedule Step"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleStepParamSchema),
    validateData(UpdateScheduleStepSchema),
    async (c): Promise<void | Response> => {
        const { idScheduleStep } = c.req.valid("param");
        const { scheduleStepName, scheduleStepCode, isActive } = c.req.valid("json");

        const existingScheduleStep: ScheduleSteps | null = await getScheduleStepWhereUniqueService({ idScheduleStep });
        if (!existingScheduleStep) {
            return sendErrorResponse(c, 404, "Schedule step not found");
        }

        const scheduleStep: ScheduleSteps = await editScheduleStepService(
            { idScheduleStep },
            {
                scheduleStepName,
                scheduleStepCode,
                isActive,
            },
        );
        return sendSuccessResponse<ScheduleSteps>(c, 200, scheduleStep, "Successfully update schedule step");
    },
);

// Schedule Management
scheduleRouter.get(
    "/",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get All Schedule',
            }
        },
        summary: "Get All Schedule"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateQuery(ScheduleQuerySchema),
    async (c): Promise<void | Response> => {
        const { page: pPage, limit: pLimit, sortBy, scheduleName, scheduleCode, scheduleYear, isActive } = c.req.valid("query");
        const baseWhere: Prisma.SchedulesWhereInput = { dateDeleted: null };
        const where: Prisma.SchedulesWhereInput[] = [baseWhere];
        let orderBy: Prisma.SchedulesOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (scheduleName) {
            where.push({
                scheduleName: {
                    contains: scheduleName.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }

        if (scheduleCode) {
            where.push({
                scheduleCode: {
                    contains: scheduleCode.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }

        if (scheduleYear) {
            where.push({
                scheduleYear: Number(scheduleYear),
            });
        }

        if (isActive) {
            where.push({
                isActive: isActive === "true",
            });
        }

        if (sortBy) {
            const sortArray: string[] = Array.isArray(sortBy) ? sortBy : [sortBy];

            sortArray.forEach((sort: string): void => {
                if (typeof sort === "string") {
                    const [key, valueRaw = "asc"] = sort.split(":");
                    const value: "asc" | "desc" = valueRaw.toLowerCase() === "desc" ? "desc" : "asc";
                    const sortValue = value as "asc" | "desc";
                    orderBy.push({ [key]: sortValue });
                }
            });
        }

        const [total, total_filtered, dataSchedule] = await Promise.all([
            countAllScheduleService({ where: [baseWhere] }),
            countAllScheduleService({ where }),
            getAllScheduleService(where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TScheduleWithOrderingNumber[] = dataSchedule.map(
            (item: Schedules, index: number): TScheduleWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TScheduleWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TScheduleWithOrderingNumber>>(c, 200, data, "Successfully get all schedule");
    },
);

scheduleRouter.get("/by-year", requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Schedule',
            }
        },
        summary: "Get Schedule"
    }),
    validateQuery(ScheduleGetByYearQuery), async (c): Promise<void | Response> => {
        const { year } = c.req.valid("query");

        const data: Schedules | null = await getScheduleByYearService(year);
        if (!data) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        return sendSuccessResponse<{
            idSchedule: string;
        }>(
            c,
            200,
            {
                idSchedule: data.idSchedule,
            },
            "Successfully get schedule",
        );
    });

scheduleRouter.get(
    "/lists",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get All Schedule',
            }
        },
        summary: "Get All Schedule"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateQuery(ScheduleQueryAllSchema),
    async (c): Promise<void | Response> => {
        const { scheduleYear } = c.req.valid("query");
        const where: Prisma.SchedulesWhereInput = {};
        if (scheduleYear) {
            where.scheduleYear = Number(scheduleYear);
        }
        const data: Schedules[] = await getAllScheduleWhereService(where);
        return sendSuccessResponse<Schedules[]>(c, 200, data, "Successfully get all schedule");
    },
);

scheduleRouter.get("/lists-user", requireLogin, async (c): Promise<void | Response> => {
    const where: Prisma.SchedulesWhereInput = {
        dateDeleted: null,
        currentApprovalRequest: {
            status: ApprovalStatus.APPROVED,
            isActive: true,
            dateDeleted: null,
        },
        currentApprovalScheduleStandardRequest: {
            status: ApprovalStatus.APPROVED,
            isActive: true,
            dateDeleted: null,
        },
    };
    const data: Schedules[] = await getAllScheduleWhereService(where);
    return sendSuccessResponse<Schedules[]>(c, 200, data, "Successfully get all schedule");
});

scheduleRouter.post(
    "/",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            201: {
                description: 'Successfully Get Add Schedule',
            }
        },
        summary: "Get Add Schedule"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateData(AddScheduleSchema),
    async (c): Promise<void | Response> => {
        const { scheduleName, scheduleCode, scheduleYear, scheduleStart, scheduleEnd } = c.req.valid("json");

        const schedule: Schedules = await addScheduleService({
            scheduleName,
            scheduleCode: scheduleCode!,
            scheduleYear: Number(scheduleYear),
            scheduleStart: new Date(scheduleStart!),
            scheduleEnd: new Date(scheduleEnd!),
            scheduleStages: {
                createMany: {
                    data: DEFAULT_STAGES.map(
                        (s: STAGES): Prisma.ScheduleStagesCreateManyScheduleInput => ({
                            type: s.type,
                            order: s.order,
                            position: s.position,
                        }),
                    ),
                    skipDuplicates: true,
                },
            },
        });

        return sendSuccessResponse<Schedules>(c, 201, schedule, "Successfully add schedule");
    },
);

scheduleRouter.get(
    "/:idSchedule",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Schedule',
            }
        },
        summary: "Get Schedule"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");

        const schedule: TScheduleWithApprovalRequest | null = await getScheduleWhereUniqueService({ idSchedule });

        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        return sendSuccessResponse<TScheduleWithApprovalRequest>(c, 200, schedule, "Successfully get schedule");
    },
);

// Schedule Standard Assignment Management

scheduleRouter.get(
    "/:idSchedule/standard-assignments",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Schedule Standard Assignment',
            }
        },
        summary: "Get Schedule Standard Assignment"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    validateQuery(ScheduleAssignmentsQuerySchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const { page: pPage, limit: pLimit, sortBy, standardCode, standardName, isActive } = c.req.valid("query");
        const baseWhere: Prisma.ScheduleStandardAssignmentsWhereInput = { dateDeleted: null };
        const where: Prisma.ScheduleStandardAssignmentsWhereInput[] = [baseWhere];
        let orderBy: Prisma.ScheduleStandardAssignmentsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        const schedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        if (standardName) {
            where.push({
                scheduleStandard: {
                    standard: {
                        standardName: {
                            contains: standardName.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                },
            });
        }

        if (standardCode) {
            where.push({
                scheduleStandard: {
                    standard: {
                        standardCode: {
                            contains: standardCode.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                },
            });
        }

        if (isActive) {
            where.push({
                isActive: isActive === "true",
            });
        }

        if (sortBy) {
            const sortArray: string[] = Array.isArray(sortBy) ? sortBy : [sortBy];

            sortArray.forEach((sort: string): void => {
                if (typeof sort === "string") {
                    const [key, valueRaw = "asc"] = sort.split(":");
                    const value: "asc" | "desc" = valueRaw.toLowerCase() === "desc" ? "desc" : "asc";
                    const sortValue = value as "asc" | "desc";
                    orderBy.push({ [key]: sortValue });
                }
            });
        }

        const [total, total_filtered, dataStandard] = await Promise.all([
            countAllScheduleStandardAssignmentsPaginationService({
                where: [{ scheduleStandard: { idSchedule } }],
            }),
            countAllScheduleStandardAssignmentsPaginationService({ where: [...where, { scheduleStandard: { idSchedule } }] }),
            getScheduleStandardAssignmentsPaginationService(idSchedule, where, orderBy, skip, limit),
        ]);

        const summaries: TScheduleAssignmentSummary[] = dataStandard.map(mapAssignmentToSummary);
        const dataWithOrderingNumber: TScheduleAssignmentSummaryWithOrderingNumber[] = summaries.map(
            (item: TScheduleAssignmentSummary, index: number): TScheduleAssignmentSummaryWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TScheduleAssignmentSummaryWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TScheduleAssignmentSummaryWithOrderingNumber>>(
            c,
            200,
            data,
            "Successfully get schedule standard assignments",
        );
    },
);

scheduleRouter.post(
    "/:idSchedule/standard-assignments",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            201: {
                description: 'Successfully Get Add Assignment',
            }
        },
        summary: "Get Add Assignment"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    validateData(AddScheduleStandardAssignmentSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const { idStandard, idTemplateStandard, leadId, memberIds, unitIds } = c.req.valid("json");

        const schedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const standard: Standards | null = await getStandardWhereUniqueService({ idStandard });
        if (!standard || standard.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard not found");
        }

        if (!unitIds || unitIds.length === 0) {
            return sendErrorResponse(c, 400, "Chose at least one unit");
        }

        const createdAssignment: TScheduleStandardAssignmentWithRelations = await addScheduleStandardAssignmentService({
            idSchedule,
            idStandard,
            idTemplateStandard,
            leadId,
            memberIds,
            unitIds,
        });

        const summary: TScheduleAssignmentSummary = mapAssignmentToSummary(createdAssignment);

        return sendSuccessResponse<TScheduleAssignmentSummary>(c, 201, summary, "Berhasil menambahkan penugasan");
    },
);

scheduleRouter.get(
    "/:idSchedule/standard-assignments/final-document",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get SK Assignment Document',
            }
        },
        summary: "Get SK Assignment Document"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");

        const schedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const finalDocument: FinalDocuments | null = await getFinalDocumentByTypeAndIdService(
            DocumentFinalType.SCHEDULE_ASSIGNMENT,
            idSchedule,
        );
        if (!finalDocument) {
            return sendErrorResponse(c, 404, "Dokumen SK tidak ditemukan");
        }

        return sendSuccessResponse<FinalDocuments>(c, 200, finalDocument, "Berhasil mendapatkan dokumen SK penugasan");
    },
);

scheduleRouter.post(
    "/:idSchedule/standard-assignments/final-document",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Upload SK Assignment',
            }
        },
        summary: "Upload SK Assignment"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        const schedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const formData = await c.req.formData();
        const file: FormDataEntryValue | null = formData.get("file");

        if (!file || !(file instanceof File)) {
            return sendErrorResponse(c, 400, "File SK is required");
        }

        const allowedMimeTypes: string[] = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (file.type && !allowedMimeTypes.includes(file.type)) {
            return sendErrorResponse(c, 400, "Format file is only PDF or Word Document");
        }

        const MAX_FILE_SIZE: number = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return sendErrorResponse(c, 400, "File size must be less than 5MB");
        }

        const buffer: Buffer<ArrayBuffer> = Buffer.from(await file.arrayBuffer());

        let savedFile: {
            absolutePath: string;
            relativeUrl: string;
            storedFileName: string;
        } | null = null;

        try {
            savedFile = await saveLocalFile(buffer, {
                originalName: file.name,
                directory: "schedule-assignment-sk",
            });
        } catch (error) {
            console.error("Failed to save file", error);
            return sendErrorResponse(c, 500, "Gagal menyimpan file");
        }

        try {
            const existingFinalDocument: FinalDocuments | null = await getFinalDocumentByTypeAndIdService(
                DocumentFinalType.SCHEDULE_ASSIGNMENT,
                idSchedule,
            );

            let finalDocument: FinalDocuments;

            if (existingFinalDocument) {
                await deleteLocalFileByUrl(existingFinalDocument.fileUrl);
                finalDocument = await updateFinalDocumentService(
                    { idFinalDocument: existingFinalDocument.idFinalDocument },
                    {
                        fileName: file.name,
                        fileUrl: savedFile.relativeUrl,
                        uploadedUser: {
                            connect: {
                                idUser,
                            },
                        },
                        confirmedUser: existingFinalDocument.confirmedBy
                            ? {
                                disconnect: true,
                            }
                            : undefined,
                        confirmedAt: null,
                        isConfirmed: false,
                    },
                );
            } else {
                finalDocument = await addAssignmentFinalDocumentService({
                    documentFinalType: DocumentFinalType.SCHEDULE_ASSIGNMENT,
                    documentFinalId: idSchedule,
                    fileName: file.name,
                    fileUrl: savedFile.relativeUrl,
                    uploadedUser: {
                        connect: {
                            idUser,
                        },
                    },
                });
            }

            return sendSuccessResponse<FinalDocuments>(c, 200, finalDocument, "Berhasil mengunggah SK penugasan");
        } catch (error) {
            await deleteLocalFileByUrl(savedFile?.relativeUrl);
            console.error("Failed to store final document", error);
            return sendErrorResponse(c, 500, "Gagal menyimpan data SK");
        }
    },
);

scheduleRouter.get(
    "/:idSchedule/standard-assignments/export",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Export Assignment',
            }
        },
        summary: "Export Assignment"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");

        const schedule = (await getScheduleWhereUniqueService({ idSchedule })) as TSchduleWithRelations | null;

        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const standardAssignment: TScheduleStandardFormulatorMaping[] = await getAllScheduleStandardAssignmentService(idSchedule);

        const pdfBuffer: Uint8Array<ArrayBufferLike> = await generateStandardFormulatorPdf(standardAssignment);
        const slugifiedName: string = schedule.scheduleName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        const filename = `penugasan-${slugifiedName || schedule.idSchedule}.pdf`;

        const pdfArrayBuffer = pdfBuffer.slice().buffer as ArrayBuffer;

        return new Response(pdfArrayBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    },
);

scheduleRouter.delete(
    "/:idSchedule/standard-assignments/:idScheduleStandardAssignment",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Delete Assignment',
            }
        },
        summary: "Get Delete Assignment"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleAssignmentParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule, idScheduleStandardAssignment } = c.req.valid("param");

        const schedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const existingAssignment = await getScheduleStandardAssignmentByIdService(idScheduleStandardAssignment);
        if (!existingAssignment || existingAssignment.scheduleStandard.idSchedule !== idSchedule || existingAssignment.dateDeleted) {
            return sendErrorResponse(c, 404, "Penugasan tidak ditemukan");
        }

        const deletedAssignment = await deleteScheduleStandardAssignmentService(idScheduleStandardAssignment);
        if (!deletedAssignment) {
            return sendErrorResponse(c, 404, "Penugasan tidak ditemukan");
        }

        return sendSuccessResponse<TScheduleAssignmentSummary>(
            c,
            200,
            mapAssignmentToSummary(deletedAssignment),
            "Berhasil menghapus penugasan",
        );
    },
);

scheduleRouter.get(
    "/:idSchedule/final-document",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get SK Schedule Document',
            }
        },
        summary: "Get SK Schedule Document"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");

        const schedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const finalDocument: FinalDocuments | null = await getFinalDocumentByTypeAndIdService(DocumentFinalType.SCHEDULE, idSchedule);
        if (!finalDocument) {
            return sendErrorResponse(c, 404, "Dokumen SK tidak ditemukan");
        }

        return sendSuccessResponse<FinalDocuments>(c, 200, finalDocument, "Berhasil mendapatkan dokumen SK penjadwalan");
    },
);

// Schedule Management

scheduleRouter.post(
    "/:idSchedule/final-document",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Upload SK Schedule',
            }
        },
        summary: "Get Upload SK Schedule"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        const schedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const formData = await c.req.formData();
        const file: FormDataEntryValue | null = formData.get("file");

        if (!file || !(file instanceof File)) {
            return sendErrorResponse(c, 400, "File SK is required");
        }

        const allowedMimeTypes: string[] = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (file.type && !allowedMimeTypes.includes(file.type)) {
            return sendErrorResponse(c, 400, "Format file is only PDF or Word Document");
        }

        const MAX_FILE_SIZE: number = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return sendErrorResponse(c, 400, "File size must be less than 5MB");
        }

        const buffer: Buffer<ArrayBuffer> = Buffer.from(await file.arrayBuffer());

        let savedFile: {
            absolutePath: string;
            relativeUrl: string;
            storedFileName: string;
        } | null = null;

        try {
            savedFile = await saveLocalFile(buffer, {
                originalName: file.name,
                directory: "schedule-sk",
            });
        } catch (error) {
            console.error("Failed to save file", error);
            return sendErrorResponse(c, 500, "Gagal menyimpan file");
        }

        try {
            const existingFinalDocument: FinalDocuments | null = await getFinalDocumentByTypeAndIdService(
                DocumentFinalType.SCHEDULE,
                idSchedule,
            );

            let finalDocument: FinalDocuments;

            if (existingFinalDocument) {
                await deleteLocalFileByUrl(existingFinalDocument.fileUrl);
                finalDocument = await updateFinalDocumentService(
                    { idFinalDocument: existingFinalDocument.idFinalDocument },
                    {
                        fileName: file.name,
                        fileUrl: savedFile.relativeUrl,
                        uploadedUser: {
                            connect: {
                                idUser,
                            },
                        },
                        confirmedUser: existingFinalDocument.confirmedBy
                            ? {
                                disconnect: true,
                            }
                            : undefined,
                        confirmedAt: null,
                        isConfirmed: false,
                    },
                );
            } else {
                finalDocument = await createFinalDocumentService({
                    documentFinalType: DocumentFinalType.SCHEDULE,
                    documentFinalId: idSchedule,
                    fileName: file.name,
                    fileUrl: savedFile.relativeUrl,
                    uploadedUser: {
                        connect: {
                            idUser,
                        },
                    },
                });
            }

            return sendSuccessResponse<FinalDocuments>(c, 200, finalDocument, "Berhasil mengunggah SK penjadwalan");
        } catch (error) {
            await deleteLocalFileByUrl(savedFile?.relativeUrl);
            console.error("Failed to store final document", error);
            return sendErrorResponse(c, 500, "Gagal menyimpan data SK");
        }
    },
);

scheduleRouter.post(
    "/:idSchedule/public-test",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            201: {
                description: 'Successfully Submit Create Public Test',
            }
        },
        summary: "Submit Create Public Test"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");

        const schedule: TScheduleWithApprovalRequest | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        try {
            const isPublicTest: boolean = await addPublicTestFromScheduleService(schedule.idSchedule);

            if (!isPublicTest) {
                return sendErrorResponse(c, 500, "Failed to create public test");
            }

            return sendSuccessResponse<null>(c, 201, null, "Successfully create public test");
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendErrorResponse(c, 404, error.message);
            }
            if (error instanceof FailedError) {
                return sendErrorResponse(c, 400, error.message);
            }
            return sendErrorResponse(c, 500, "Failed to create public test");
        }
    },
);

scheduleRouter.post(
    "/:idSchedule/submission",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Submit Schedule Schedule for Approval',
            }
        },
        summary: "Submit Schedule Schedule for Approval"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        const schedule: TScheduleWithApprovalRequest | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        if (!schedule.currentApprovalRequest) {
            return sendErrorResponse(c, 404, "Approval request not found");
        }
        const allowedStatuses: ApprovalStatus[] = [ApprovalStatus.DRAFT, ApprovalStatus.REJECTED];

        if (!allowedStatuses.includes(schedule.currentApprovalRequest.status)) {
            return sendErrorResponse(c, 400, "Schedule already submitted for approval");
        }

        await editScheduleService(
            { idSchedule },
            {
                currentApprovalRequest: {
                    update: {
                        createdBy: {
                            connect: {
                                idUser,
                            },
                        },
                        status: ApprovalStatus.PENDING,
                        ...(schedule.currentApprovalRequest.status === ApprovalStatus.DRAFT && {
                            currentStepOrder: 1,
                        }),
                        submittedAt: new Date(),
                        ...(schedule.currentApprovalRequest.status === ApprovalStatus.REJECTED && {
                            steps: {
                                update: {
                                    where: {
                                        requestId_stepOrder: {
                                            requestId: schedule.currentApprovalRequest.idApprovalRequest,
                                            stepOrder: schedule.currentApprovalRequest.currentStepOrder || 1,
                                        },
                                    },
                                    data: {
                                        status: ApprovalStatus.PENDING,
                                        actedAt: null,
                                        note: null,
                                    },
                                },
                            },
                        }),
                    },
                },
            },
        );

        // TODO: Send email OR Whatsapp Notification to Current Step order Approver

        return sendSuccessResponse<null>(c, 200, null, "successfully submit schedule for approval");
    },
);

scheduleRouter.post(
    "/:idSchedule/submission-standard",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Submit Schedule Standard for Approval',
            }
        },
        summary: "Submit Schedule Standard for Approval"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        const schedule: TScheduleWithApprovalRequest | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        if (!schedule.currentApprovalScheduleStandardRequest) {
            return sendErrorResponse(c, 404, "Approval request schedule standard not found");
        }
        const allowedStatuses: ApprovalStatus[] = [ApprovalStatus.DRAFT, ApprovalStatus.REJECTED];

        if (!allowedStatuses.includes(schedule.currentApprovalScheduleStandardRequest.status)) {
            return sendErrorResponse(c, 400, "Schedule standard already submitted for approval");
        }

        await editScheduleService(
            { idSchedule },
            {
                currentApprovalScheduleStandardRequest: {
                    update: {
                        createdBy: {
                            connect: {
                                idUser,
                            },
                        },
                        status: ApprovalStatus.PENDING,
                        ...(schedule.currentApprovalScheduleStandardRequest.status === ApprovalStatus.DRAFT && {
                            currentStepOrder: 1,
                        }),
                        submittedAt: new Date(),
                        ...(schedule.currentApprovalScheduleStandardRequest.status === ApprovalStatus.REJECTED && {
                            steps: {
                                update: {
                                    where: {
                                        requestId_stepOrder: {
                                            requestId: schedule.currentApprovalScheduleStandardRequest.idApprovalRequest,
                                            stepOrder: schedule.currentApprovalScheduleStandardRequest.currentStepOrder || 1,
                                        },
                                    },
                                    data: {
                                        status: ApprovalStatus.PENDING,
                                        actedAt: null,
                                        note: null,
                                    },
                                },
                            },
                        }),
                    },
                },
            },
        );

        // TODO: Send email OR Whatsapp Notification to Current Step order Approver

        return sendSuccessResponse<null>(c, 200, null, "successfully submit schedule standard for approval");
    },
);

scheduleRouter.patch(
    "/:idSchedule",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Update Schedule',
            }
        },
        summary: "Update Schedule"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    validateData(UpdateScheduleSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const { scheduleName, scheduleCode, scheduleYear, scheduleStart, scheduleEnd, isActive } = c.req.valid("json");

        const existingSchedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });

        if (!existingSchedule || existingSchedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const data: Prisma.SchedulesUpdateInput = {};

        if (scheduleName !== undefined) {
            data.scheduleName = scheduleName;
        }

        if (scheduleCode !== undefined && scheduleCode !== null) {
            data.scheduleCode = scheduleCode;
        }

        if (scheduleYear !== undefined && scheduleYear !== null) {
            data.scheduleYear = Number(scheduleYear);
        }

        if (scheduleStart !== undefined && scheduleStart !== null) {
            data.scheduleStart = new Date(scheduleStart);
        }

        if (scheduleEnd !== undefined && scheduleEnd !== null) {
            data.scheduleEnd = new Date(scheduleEnd);
        }

        if (isActive !== undefined) {
            data.isActive = isActive;
        }

        if (Object.keys(data).length === 0) {
            return sendErrorResponse(c, 400, "No data provided to update");
        }

        const schedule: Schedules = await editScheduleService({ idSchedule }, data);

        return sendSuccessResponse<Schedules>(c, 200, schedule, "Successfully update schedule");
    },
);

scheduleRouter.delete(
    "/:idSchedule",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Delete Schedule Activity',
            }
        },
        summary: "Delete Schedule Activity"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");

        const existingSchedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });

        if (!existingSchedule || existingSchedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const schedule: Schedules = await deleteScheduleService({ idSchedule });

        return sendSuccessResponse<Schedules>(c, 200, schedule, "Successfully delete schedule");
    },
);

// Schedule Activity Management
scheduleRouter.get(
    "/:idSchedule/schedule-activity",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Schedule Activity',
            }
        },
        summary: "Get Schedule Activity"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    validateQuery(ScheduleActivityQuerySchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const existingSchedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!existingSchedule || existingSchedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const { page: pPage, limit: pLimit, sortBy, scheduleStepName, scheduleStepCode, activityName, isActive } = c.req.valid("query");
        const page: number = pPage ? Number(pPage) : 1;
        const limit: number = pLimit ? Number(pLimit) : 10;
        const skip: number = (page - 1) * limit;
        const where: Prisma.ScheduleActivitiesWhereInput[] = [];
        let orderBy: Prisma.ScheduleActivitiesOrderByWithRelationInput[] = [];

        if (activityName) {
            where.push({
                activityName: {
                    contains: activityName.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }

        if (scheduleStepName) {
            where.push({
                scheduleStep: {
                    scheduleStepName: {
                        contains: scheduleStepName.toLowerCase(),
                        mode: "insensitive",
                    },
                },
            });
        }

        if (scheduleStepCode) {
            where.push({
                scheduleStep: {
                    scheduleStepCode: {
                        contains: scheduleStepCode.toLowerCase(),
                        mode: "insensitive",
                    },
                },
            });
        }

        if (isActive) {
            where.push({
                isActive: isActive === "true",
            });
        }

        if (sortBy) {
            if (Array.isArray(sortBy)) {
                sortBy.forEach((sort: string): void => {
                    if (typeof sort === "string") {
                        const [key, valueRaw = "asc"] = sort.split(":");
                        const value = valueRaw === "asc" ? "asc" : "desc";
                        const sortValue = value as "asc" | "desc";
                        orderBy.push({ [key]: sortValue });
                    }
                });
            }
        }

        const [total, total_filtered, dataScheduleActivity] = await Promise.all([
            countAllScheduleActivityService(idSchedule),
            countAllScheduleActivityService(idSchedule, { where }),
            getAllScheduleActivityService(idSchedule, where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TScheduleActivityWithOrderingNumber[] = dataScheduleActivity.map(
            (item: TScheduleActivityWithRelations, index: number): TScheduleActivityWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TScheduleActivityWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TScheduleActivityWithOrderingNumber>>(c, 200, data, "Successfully get schedule activity");
    },
);

scheduleRouter.get(
    "/:idSchedule/schedule-activity/export",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Export Schedule Activity',
            }
        },
        summary: "Export Schedule Activity"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");

        const schedule = (await getScheduleWhereUniqueService({ idSchedule })) as TSchduleWithRelations | null;

        if (!schedule || schedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const pdfBuffer = await generateScheduleActivitiesPdf(schedule, schedule.scheduleActivities ?? []);
        const slugifiedName = schedule.scheduleName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        const filename = `penjadwalan-${slugifiedName || schedule.idSchedule}.pdf`;

        const pdfArrayBuffer = pdfBuffer.slice().buffer as ArrayBuffer;

        return new Response(pdfArrayBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    },
);

scheduleRouter.get(
    "/:idSchedule/schedule-activity/:idScheduleActivity",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Get Schedule Activity',
            }
        },
        summary: "Get Schedule Activity"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    validateParams(ScheduleActivityParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule, idScheduleActivity } = c.req.valid("param");

        const existingSchedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!existingSchedule || existingSchedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const existingScheduleActivity: ScheduleActivities | null = await getScheduleActivityWhereUniqueService({
            idScheduleActivity,
        });
        if (!existingScheduleActivity) {
            return sendErrorResponse(c, 404, "Schedule activity not found");
        }

        return sendSuccessResponse<ScheduleActivities>(c, 200, existingScheduleActivity, "Successfully get schedule activity");
    },
);

scheduleRouter.post(
    "/:idSchedule/schedule-activity",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            201: {
                description: 'Successfully Add Schedule Activity',
            }
        },
        summary: "Add Schedule Activity"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleParamSchema),
    validateData(AddScheduleActivitySchema),
    async (c): Promise<void | Response> => {
        const { idSchedule } = c.req.valid("param");
        const existingSchedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!existingSchedule || existingSchedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }
        const { idScheduleStep, activityName, dateStarted, dateEnded } = c.req.valid("json");

        const scheduleActivity: ScheduleActivities = await addScheduleActivityService({
            schedule: {
                connect: {
                    idSchedule,
                },
            },
            scheduleStep: {
                connect: {
                    idScheduleStep,
                },
            },
            activityName,
            dateStarted: new Date(dateStarted),
            dateEnded: new Date(dateEnded),
        });

        return sendSuccessResponse<ScheduleActivities>(c, 201, scheduleActivity, "Successfully add schedule activity");
    },
);

scheduleRouter.patch(
    "/:idSchedule/schedule-activity/:idScheduleActivity",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Update Schedule Activity',
            }
        },
        summary: "Update Schedule Activity"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleActivityUpdateParamSchema),
    validateData(UpdateScheduleActivitySchema),
    async (c): Promise<void | Response> => {
        const { idSchedule, idScheduleActivity } = c.req.valid("param");
        const { activityName, dateStarted, dateEnded, isActive, idScheduleStep } = c.req.valid("json");

        const existingSchedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!existingSchedule || existingSchedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const existingScheduleActivity: ScheduleActivities | null = await getScheduleActivityWhereUniqueService({ idScheduleActivity });
        if (!existingScheduleActivity) {
            return sendErrorResponse(c, 404, "Schedule activity not found");
        }

        const scheduleActivity: ScheduleActivities = await editScheduleActivityService(
            { idScheduleActivity },
            {
                ...(activityName !== existingScheduleActivity.activityName && { activityName }),
                ...(new Date(dateStarted!) !== existingScheduleActivity.dateStarted && { dateStarted: new Date(dateStarted!) }),
                ...(new Date(dateEnded!) !== existingScheduleActivity.dateEnded && { dateEnded: new Date(dateEnded!) }),
                ...(isActive !== undefined && { isActive }),
                ...(idScheduleStep !== undefined && {
                    scheduleStep: {
                        connect: {
                            idScheduleStep,
                        },
                    },
                }),
            },
        );

        return sendSuccessResponse<ScheduleActivities>(c, 200, scheduleActivity, "Successfully update schedule activity");
    },
);

scheduleRouter.delete(
    "/:idSchedule/schedule-activity/:idScheduleActivity",
    requireLogin,
    describeRoute({
        tags: ["Schedule"],
        responses: {
            200: {
                description: 'Successfully Delete Scbedule Activity',
            }
        },
        summary: "Delete Scbedule Activity"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ScheduleActivityUpdateParamSchema),
    async (c): Promise<void | Response> => {
        const { idSchedule, idScheduleActivity } = c.req.valid("param");

        const existingSchedule: Schedules | null = await getScheduleWhereUniqueService({ idSchedule });
        if (!existingSchedule || existingSchedule.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule not found");
        }

        const existingScheduleActivity: ScheduleActivities | null = await getScheduleActivityWhereUniqueService({ idScheduleActivity });
        if (!existingScheduleActivity) {
            return sendErrorResponse(c, 404, "Schedule activity not found");
        }

        const scheduleActivity: ScheduleActivities = await deleteScheduleActivityService({ idScheduleActivity });

        return sendSuccessResponse<ScheduleActivities>(c, 200, scheduleActivity, "Successfully delete schedule activity");
    },
);

export default scheduleRouter;
