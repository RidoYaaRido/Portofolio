import { Hono } from "hono";
import { protectUnitAndTypeCombo, requireLogin, validateData, validateParams, validateQuery } from "../middlewares/auth.middleware.js";
import { SAM_WITH_PPM_UNIT } from "../configs/protect-role.config.js";
import {
    AddStandardDetailSchema,
    AddStandardDetailTypeSchema,
    AddStandardFormulationSchema,
    AddStandardSchema,
    AddStandardTemplateSchema,
    StandardDetailParamSchema,
    StandardDetailQuerySchema,
    StandardDetailTypeQuerySchema,
    StandardFormulationParamSchema,
    StandardParamSchema,
    StandardQuerySchema,
    StandardTemplateParamSchema,
    StandardTemplateQuerySchema,
    StandardTemplateTypeParamSchema,
    UpdateStandardDetailSchema,
    UpdateStandardDetailTypeSchema,
    UpdateStandardFormulationSchema,
    UpdateStandardSchema,
    UpdateStandardTemplateSchema,
} from "../validations/standard.validation.js";
import type {
    Prisma,
    ScheduleStandardAssignments,
    StandardDetails,
    StandardDetailTypes,
    Standards,
    StandardTemplates,
} from "../generated/prisma/index.js";
import {
    addStandardAssignmentApprovalService,
    addStandardDetailService,
    addStandardDetailTypeService,
    addStandardFormulationService,
    addStandardService,
    addStandardTemplateService,
    countAllStandardAssignmentApprovalService,
    countAllStandardAssignmentFormulationService,
    countAllStandardAssignmentPublicTestService,
    countAllStandardDetailService,
    countAllStandardService,
    deleteStandardDetailService,
    deleteStandardDetailTypeService,
    deleteStandardService,
    deleteStandardTemplateService,
    editStandardAssignmentSubmissionService,
    editStandardDetailService,
    editStandardDetailTypeService,
    editStandardService,
    editStandardTemplateService,
    getAllStandardAssignmentApprovalService,
    getAllStandardAssignmentFormulationService,
    getAllStandardAssignmentPublicTestService,
    getAllStandardDetailService,
    getAllStandardDetailTypeService,
    getAllStandardService,
    getAllStandardTemplateService,
    getScheduleStandardAssignmentWhereUniqueService,
    getStandardAssignmentApprovalWhereUniqueService,
    getStandardAssignmentFormulationWhereUniqueService,
    getStandardAssignmentReferenceDocumentsService,
    getStandardAssignmnetWhereUniqueService,
    getStandardDetailTypeWhereUniqueService,
    getStandardDetailWhereUniqueService,
    getStandardFormulationContentsService,
    getStandardTemplateWhereUniqueService,
    getStandardWhereUniqueService,
    updateStandardFormulationService,
} from "../services/standard.service.js";
import type {
    TStandardAssignmentApprovalList,
    TStandardAssignmentApprovalListWithOrderingNumber,
    TStandardAssignmentDocuments,
    TStandardAssignmentFormulationWithRelations,
    TStandardAssignmentSummaryWithOrderingNumber,
    TStandardDetailWithOrderingNumber,
    TStandardFormulationContentWithRelations,
    TStandardFormulationWithRelations,
    TStandardFormulationWithRelationsWithDecisionStatus,
    TStandardTemplatesWithType,
    TStandardWithOrderingNumber,
} from "../types/standard.js";
import type { Pagination } from "../types/pagination.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/api-response.js";
import { FailedError, NotFoundError } from "../utils/error.js";
import {
    AddScheduleApprovalDecisionSchema,
    ScheduleAssignmentsQuerySchema,
    ScheduleParamSchema,
} from "../validations/schedule.validation.js";
import type { TAssignmentMember, TAssignmentUnit } from "../types/schedule.js";
import { describeRoute } from "hono-openapi";

const standardRouter = new Hono();

//STANDARD FORMULATION APPROVAL
standardRouter.get(
    "/approval/formulation/:idSchedule",
     requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Successfully get all standard formulation approval',}},  
            summary: "Get All Standard Formulation Approval" }),
    validateParams(ScheduleParamSchema),
    validateQuery(ScheduleAssignmentsQuerySchema),
    async (c) => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const { page: pPage, limit: pLimit, sortBy, standardName, standardCode, isActive } = c.req.valid("query");
        const where: Prisma.ApprovalStepsWhereInput[] = [];
        let orderBy: Prisma.ApprovalStepsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (standardName) {
            where.push({
                request: {
                    currentForStandardAssignment: {
                        scheduleStandard: {
                            standard: {
                                standardName: {
                                    contains: standardName.toLowerCase(),
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                },
            });
        }

        if (standardCode) {
            where.push({
                request: {
                    currentForStandardAssignment: {
                        scheduleStandard: {
                            standard: {
                                standardCode: {
                                    contains: standardCode.toLowerCase(),
                                    mode: "insensitive",
                                },
                            },
                        },
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
            countAllStandardAssignmentApprovalService(idUser, idSchedule),
            countAllStandardAssignmentApprovalService(idUser, idSchedule, { where }),
            getAllStandardAssignmentApprovalService(idUser, idSchedule, where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TStandardAssignmentApprovalListWithOrderingNumber[] = dataApproval.map(
            (item: TStandardAssignmentApprovalList, index: number): TStandardAssignmentApprovalListWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TStandardAssignmentApprovalListWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TStandardAssignmentApprovalListWithOrderingNumber>>(
            c,
            200,
            data,
            "Successfully get all standard formulation approval",
        );
    },
);

standardRouter.post(
    "/approval/formulation/:idScheduleStandardAssignment",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                201: {
            description: 'Successfully make decision for standard assignment',}},  
            summary: "Approval Standard" }),
    validateParams(StandardFormulationParamSchema),
    validateData(AddScheduleApprovalDecisionSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const { note, status } = c.req.valid("json");
        try {
            const approve: boolean = await addStandardAssignmentApprovalService(idScheduleStandardAssignment, idUser, {
                note,
                status,
            });

            if (!approve) {
                return sendErrorResponse(c, 500, "Failed to approve standard assignment");
            }
            // TODO: Send Email OR Whatsapp to whose created the standard assignment
            return sendSuccessResponse(c, 201, null, "Successfully make decision for standard assignment");
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendErrorResponse(c, 404, error.message);
            }
            if (error instanceof FailedError) {
                return sendErrorResponse(c, 400, error.message);
            }
            return sendErrorResponse(c, 500, "Failed to approve standard assignment");
        }
    },
);

standardRouter.get(
    "/approval/formulation/:idScheduleStandardAssignment/detail",
   requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Successfully get standard assignment',}},  
            summary: "Get Formulation Standard Assignment" }),
    validateParams(StandardFormulationParamSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        const standardFormulation:
            | (TStandardFormulationWithRelationsWithDecisionStatus & {
                  referenceDocuments?: TStandardAssignmentDocuments[];
              })
            | null = await getStandardAssignmentApprovalWhereUniqueService(idScheduleStandardAssignment, idUser);

        if (!standardFormulation) {
            return sendErrorResponse(c, 404, "Standard assignment not found");
        }

        return sendSuccessResponse<
            | (TStandardFormulationWithRelationsWithDecisionStatus & {
                  referenceDocuments?: TStandardAssignmentDocuments[];
              })
            | null
        >(c, 200, standardFormulation, "Successfully get standard assignment");
    },
);

standardRouter.get(
    "/formulation/members/:idScheduleStandardAssignment",
   requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Successfully get all standard formulation approval',}},  
            summary: "Get All Standard Formulation Approval" }),
    validateParams(StandardFormulationParamSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        const standardFormulation: TStandardFormulationWithRelations | null = await getStandardAssignmentFormulationWhereUniqueService(
            idUser,
            idScheduleStandardAssignment,
        );

        if (!standardFormulation) {
            return sendErrorResponse(c, 404, "Standard assignment not found");
        }

        const referenceDocuments: TStandardAssignmentDocuments[] = await getStandardAssignmentReferenceDocumentsService(
            standardFormulation.idScheduleStandardAssignment,
        );

        const data: TStandardFormulationWithRelations & {
            referenceDocuments?: TStandardAssignmentDocuments[];
        } = {
            ...standardFormulation,
            referenceDocuments,
        };

        return sendSuccessResponse<
            TStandardFormulationWithRelations & {
                referenceDocuments?: TStandardAssignmentDocuments[];
            }
        >(c, 200, data, "Successfully get standard assignment");
    },
);

standardRouter.post(
    "/formulation/members/:idScheduleStandardAssignment",
     requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                201: {
            description: 'Successfully create standard formulation',}},  
            summary: "Create Standard Formulation" }),
    validateParams(StandardFormulationParamSchema),
    validateData(AddStandardFormulationSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        const { rationalAndObjectives, responsibleParties, definitions, standards, relatedDocuments } = c.req.valid("json");

        const scheduleStandardAssignment: TStandardFormulationWithRelations | null =
            await getStandardAssignmentFormulationWhereUniqueService(idUser, idScheduleStandardAssignment);

        if (!scheduleStandardAssignment || scheduleStandardAssignment.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule standard assignment not found");
        }
        const standardFormulation: TStandardFormulationWithRelations = await addStandardFormulationService(
            scheduleStandardAssignment.idScheduleStandardAssignment,
            {
                rationalAndObjectives,
                responsibleParties,
                definitions,
                standards,
                relatedDocuments,
            },
        );

        return sendSuccessResponse<TStandardFormulationWithRelations>(
            c,
            201,
            standardFormulation,
            "Successfully create standard formulation",
        );
    },
);

standardRouter.patch(
    "/formulation/members/:idScheduleStandardAssignment",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Successfully update standard formulation',}},  
            summary: "Update Standard Formulation" }),
    validateParams(StandardFormulationParamSchema),
    validateData(UpdateStandardFormulationSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const { rationalAndObjectives, responsibleParties, definitions, standards, relatedDocuments } = c.req.valid("json");

        const scheduleStandardAssignment: TStandardFormulationWithRelations | null =
            await getStandardAssignmentFormulationWhereUniqueService(idUser, idScheduleStandardAssignment);

        if (!scheduleStandardAssignment || scheduleStandardAssignment.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule standard assignment not found");
        }

        const standardFormulation: TStandardFormulationWithRelations = await updateStandardFormulationService(
            scheduleStandardAssignment.idScheduleStandardAssignment,
            {
                rationalAndObjectives,
                responsibleParties,
                definitions,
                standards,
                relatedDocuments,
            },
        );

        return sendSuccessResponse<TStandardFormulationWithRelations>(
            c,
            200,
            standardFormulation,
            "Successfully update standard formulation",
        );
    },
);

standardRouter.post(
    "/formulation/members/:idScheduleStandardAssignment/submission",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Successfully submit standard submission',}},  
            summary: "Submit Standard Submission" }),
    validateParams(StandardFormulationParamSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        try {
            await editStandardAssignmentSubmissionService(idUser, {
                idScheduleStandardAssignment,
            });
            return sendSuccessResponse(c, 200, null, "Successfully submit standard submission");
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendErrorResponse(c, 404, error.message);
            }
            return sendErrorResponse(c, 500, "Failed to submit standard submission");
        }
    },
);

//STANDARD FORMULATION MANAGEMENT
standardRouter.get(
    "/formulation/lists/:idSchedule",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Successfully get all standard formulation approval',}},  
            summary: "Get All Standard detail" }),
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get All Standard Formulation Approval',}},  
            summary: "Get All Standard Formulation Approval" }),
    validateParams(ScheduleParamSchema),
    validateQuery(ScheduleAssignmentsQuerySchema),
    async (c) => {
        const { idSchedule } = c.req.valid("param");
        const idUser: string = c.get("idUser");
        const { page: pPage, limit: pLimit, sortBy, standardName, standardCode, isActive } = c.req.valid("query");
        const where: Prisma.ScheduleStandardAssignmentsWhereInput[] = [];
        let orderBy: Prisma.ScheduleStandardAssignmentsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

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
            countAllStandardAssignmentFormulationService(idUser, idSchedule),
            countAllStandardAssignmentFormulationService(idUser, idSchedule, { where }),
            getAllStandardAssignmentFormulationService(idUser, idSchedule, where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TStandardAssignmentSummaryWithOrderingNumber[] = dataApproval.map(
            (item: TStandardAssignmentFormulationWithRelations, index: number): TStandardAssignmentSummaryWithOrderingNumber => {
                const leadMember: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number] | undefined =
                    item.assignmentMembers.find(
                        (member: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number]): boolean =>
                            member.memberType === "KETUA",
                    );
                const otherMembers: TStandardAssignmentFormulationWithRelations["assignmentMembers"] = item.assignmentMembers.filter(
                    (member: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number]): boolean =>
                        member.memberType !== "KETUA",
                );
                const hashApprovalRequest: TStandardAssignmentFormulationWithRelations["currentApprovalRequest"] =
                    item.currentApprovalRequest;
                return {
                    idScheduleStandardAssignment: item.idScheduleStandardAssignment,
                    standardName: item.scheduleStandard.standard.standardName,
                    standardCode: item.scheduleStandard.standard.standardCode,
                    lead: leadMember
                        ? {
                              idUser: leadMember.user.idUser,
                              name: leadMember.user.name,
                              username: leadMember.user.username!,
                              memberType: leadMember.memberType,
                          }
                        : null,
                    members: otherMembers.map(
                        (member: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number]): TAssignmentMember => ({
                            idUser: member.user.idUser,
                            name: member.user.fullName ?? member.user.name,
                            username: member.user.username!,
                            memberType: member.memberType,
                        }),
                    ),
                    units: item.assignmentUnits.map(
                        (assignmentUnit: TStandardAssignmentFormulationWithRelations["assignmentUnits"][number]): TAssignmentUnit => ({
                            idUnit: assignmentUnit.unit.idUnit,
                            unitName: assignmentUnit.unit.unitName,
                        }),
                    ),
                    currentApprovalRequest: hashApprovalRequest,
                    orderingNumber: index + 1,
                };
            },
        );

        const data: Pagination<TStandardAssignmentSummaryWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TStandardAssignmentSummaryWithOrderingNumber>>(
            c,
            200,
            data,
            "Successfully get all standard formulation approval",
        );
    },
);
standardRouter.get(
    "/formulation/lists/:idSchedule/public-test",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get All Standard public',}},  
            summary: "Get All Standard public" }),
    validateParams(ScheduleParamSchema),
    validateQuery(ScheduleAssignmentsQuerySchema),
    async (c) => {
        const { idSchedule } = c.req.valid("param");
        const { page: pPage, limit: pLimit, sortBy, standardName, standardCode, isActive } = c.req.valid("query");
        const where: Prisma.ScheduleStandardAssignmentsWhereInput[] = [];
        let orderBy: Prisma.ScheduleStandardAssignmentsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

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
            countAllStandardAssignmentPublicTestService(idSchedule),
            countAllStandardAssignmentPublicTestService(idSchedule, { where }),
            getAllStandardAssignmentPublicTestService(idSchedule, where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TStandardAssignmentSummaryWithOrderingNumber[] = dataApproval.map(
            (item: TStandardAssignmentFormulationWithRelations, index: number): TStandardAssignmentSummaryWithOrderingNumber => {
                const leadMember: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number] | undefined =
                    item.assignmentMembers.find(
                        (member: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number]): boolean =>
                            member.memberType === "KETUA",
                    );
                const otherMembers: TStandardAssignmentFormulationWithRelations["assignmentMembers"] = item.assignmentMembers.filter(
                    (member: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number]): boolean =>
                        member.memberType !== "KETUA",
                );
                const hashApprovalRequest: TStandardAssignmentFormulationWithRelations["currentApprovalRequest"] =
                    item.currentApprovalRequest;
                return {
                    idScheduleStandardAssignment: item.idScheduleStandardAssignment,
                    standardName: item.scheduleStandard.standard.standardName,
                    standardCode: item.scheduleStandard.standard.standardCode,
                    lead: leadMember
                        ? {
                              idUser: leadMember.user.idUser,
                              name: leadMember.user.name,
                              username: leadMember.user.username!,
                              memberType: leadMember.memberType,
                          }
                        : null,
                    members: otherMembers.map(
                        (member: TStandardAssignmentFormulationWithRelations["assignmentMembers"][number]): TAssignmentMember => ({
                            idUser: member.user.idUser,
                            name: member.user.fullName ?? member.user.name,
                            username: member.user.username!,
                            memberType: member.memberType,
                        }),
                    ),
                    units: item.assignmentUnits.map(
                        (assignmentUnit: TStandardAssignmentFormulationWithRelations["assignmentUnits"][number]): TAssignmentUnit => ({
                            idUnit: assignmentUnit.unit.idUnit,
                            unitName: assignmentUnit.unit.unitName,
                        }),
                    ),
                    currentApprovalRequest: hashApprovalRequest,
                    orderingNumber: index + 1,
                };
            },
        );

        const data: Pagination<TStandardAssignmentSummaryWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TStandardAssignmentSummaryWithOrderingNumber>>(
            c,
            200,
            data,
            "Successfully get all standard public test",
        );
    },
);
standardRouter.get("formulation/contents", requireLogin, 
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get Standard Formulation Contents',}},  
            summary: "Get Standard Formulation Contents" }),
    const formulationContents: TStandardFormulationContentWithRelations[] = await getStandardFormulationContentsService();
    return sendSuccessResponse<TStandardFormulationContentWithRelations[]>(
        c,
        200,
        formulationContents,
        "Successfully get standard formulation contents",
    );
});
standardRouter.post(
    "/formulation/:idScheduleStandardAssignment",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                201: {
            description: 'Create Standard Formulation',}},  
            summary: "Create Standard Formulation" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardFormulationParamSchema),
    validateData(AddStandardFormulationSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const { rationalAndObjectives, responsibleParties, definitions, standards, relatedDocuments } = c.req.valid("json");

        const scheduleStandardAssignment: ScheduleStandardAssignments | null = await getScheduleStandardAssignmentWhereUniqueService({
            idScheduleStandardAssignment,
        });

        if (!scheduleStandardAssignment || scheduleStandardAssignment.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule standard assignment not found");
        }
        const standardFormulation: TStandardFormulationWithRelations = await addStandardFormulationService(idScheduleStandardAssignment, {
            rationalAndObjectives,
            responsibleParties,
            definitions,
            standards,
            relatedDocuments,
        });

        return sendSuccessResponse<TStandardFormulationWithRelations>(
            c,
            201,
            standardFormulation,
            "Successfully create standard formulation",
        );
    },
);
standardRouter.get(
    "/formulation/:idScheduleStandardAssignment",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get Standard Standard Assignment',}},  
            summary: "Get Standard Standard Assignment" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardFormulationParamSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");

        const standardFormulation: TStandardFormulationWithRelations | null = await getStandardAssignmnetWhereUniqueService({
            idScheduleStandardAssignment,
        });

        if (!standardFormulation) {
            return sendErrorResponse(c, 404, "Standard assignment not found");
        }

        const referenceDocuments: TStandardAssignmentDocuments[] = await getStandardAssignmentReferenceDocumentsService(
            standardFormulation.idScheduleStandardAssignment,
        );

        const data: TStandardFormulationWithRelations & {
            referenceDocuments?: TStandardAssignmentDocuments[];
        } = {
            ...standardFormulation,
            referenceDocuments,
        };

        return sendSuccessResponse<
            TStandardFormulationWithRelations & {
                referenceDocuments?: TStandardAssignmentDocuments[];
            }
        >(c, 200, data, "Successfully get standard assignment");
    },
);
standardRouter.delete("");
standardRouter.patch(
    "/formulation/:idScheduleStandardAssignment",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Update Standard Formulation',}},  
            summary: "Update Standard Formulation" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardFormulationParamSchema),
    validateData(UpdateStandardFormulationSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const { rationalAndObjectives, responsibleParties, definitions, standards, relatedDocuments } = c.req.valid("json");

        const scheduleStandardAssignment: ScheduleStandardAssignments | null = await getScheduleStandardAssignmentWhereUniqueService({
            idScheduleStandardAssignment,
        });

        if (!scheduleStandardAssignment || scheduleStandardAssignment.dateDeleted) {
            return sendErrorResponse(c, 404, "Schedule standard assignment not found");
        }

        const standardFormulation: TStandardFormulationWithRelations = await updateStandardFormulationService(
            idScheduleStandardAssignment,
            {
                rationalAndObjectives,
                responsibleParties,
                definitions,
                standards,
                relatedDocuments,
            },
        );

        return sendSuccessResponse<TStandardFormulationWithRelations>(
            c,
            200,
            standardFormulation,
            "Successfully update standard formulation",
        );
    },
);

standardRouter.post(
    "/formulation/:idScheduleStandardAssignment/submission",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Submit Standard Submission',}},  
            summary: "Submit Standard Submission" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardFormulationParamSchema),
    async (c) => {
        const { idScheduleStandardAssignment } = c.req.valid("param");
        const idUser: string = c.get("idUser");

        try {
            await editStandardAssignmentSubmissionService(idUser, {
                idScheduleStandardAssignment,
            });

            return sendSuccessResponse(c, 200, null, "Successfully submit standard submission");
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendErrorResponse(c, 404, error.message);
            }
            return sendErrorResponse(c, 500, "Failed to submit standard submission");
        }
    },
);

//STANDARD DETAIL MANAGEMENT
standardRouter.get(
    "/template",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get All Standard detail',}},  
            summary: "Get All Standard detail" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateQuery(StandardDetailQuerySchema),
    async (c) => {
        const { page: pPage, limit: pLimit, sortBy, detailContent, detailCode, isActive } = c.req.valid("query");
        const baseWhere: Prisma.StandardDetailsWhereInput = { dateDeleted: null };
        const where: Prisma.StandardDetailsWhereInput[] = [baseWhere];
        let orderBy: Prisma.StandardDetailsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (detailContent) {
            where.push({
                detailContent: {
                    contains: detailContent.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }
        if (detailCode) {
            where.push({
                detailCode: {
                    contains: detailCode.toLowerCase(),
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

        const [total, total_filtered, dataStandardDetail] = await Promise.all([
            countAllStandardDetailService({ where: [baseWhere] }),
            countAllStandardDetailService({ where }),
            getAllStandardDetailService(where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TStandardDetailWithOrderingNumber[] = dataStandardDetail.map(
            (item: StandardDetails, index: number): TStandardDetailWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TStandardDetailWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TStandardDetailWithOrderingNumber>>(c, 200, data, "Successfully get all standard detail");
    },
);

standardRouter.post(
    "/template",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                201: {
            description: 'Get Add Standard Detail',}},  
            summary: "Get Add Standard Detail" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateData(AddStandardDetailSchema),
    async (c) => {
        const { detailContent, detailCode, detailOrder } = c.req.valid("json");
        const standardDetail: StandardDetails = await addStandardDetailService({
            detailContent,
            detailCode: detailCode!,
            detailOrder: detailOrder!,
        });
        return sendSuccessResponse<StandardDetails>(c, 201, standardDetail, "Successfully add standard detail");
    },
);

standardRouter.get(
    "/template/:idStandardDetail",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get Standard detail',}},  
            summary: "Get Standard detail" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardDetailParamSchema),
    async (c) => {
        const { idStandardDetail } = c.req.valid("param");

        const standardDetail: StandardDetails | null = await getStandardDetailWhereUniqueService({ idStandardDetail });

        if (!standardDetail || standardDetail.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard detail not found");
        }
        return sendSuccessResponse<StandardDetails>(c, 200, standardDetail, "Successfully get standard detail");
    },
);

standardRouter.delete(
    "/template/:idStandardDetail",
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Delete Standard Detail',}},  
            summary: "Delete Standard Detail" }),
    requireLogin,
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardDetailParamSchema),
    async (c) => {
        const { idStandardDetail } = c.req.valid("param");
        const standardDetail: StandardDetails | null = await getStandardDetailWhereUniqueService({ idStandardDetail });
        if (!standardDetail || standardDetail.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard detail not found");
        }
        const deletedStandardDetail: StandardDetails = await deleteStandardDetailService({ idStandardDetail });
        return sendSuccessResponse<StandardDetails>(c, 200, deletedStandardDetail, "Successfully delete standard detail");
    },
);

standardRouter.patch(
    "/template/:idStandardDetail",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Update Standard Detail',}},  
            summary: "Update Standard Detail" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardDetailParamSchema),
    validateData(UpdateStandardDetailSchema),
    async (c) => {
        const { idStandardDetail } = c.req.valid("param");
        const { detailContent, detailCode, isActive, detailOrder } = c.req.valid("json");
        const standardDetail: StandardDetails | null = await getStandardDetailWhereUniqueService({ idStandardDetail });
        if (!standardDetail || standardDetail.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard detail not found");
        }
        const data: Prisma.StandardDetailsUpdateInput = {};
        if (detailContent !== standardDetail.detailContent) {
            data.detailContent = detailContent;
        }
        if (detailCode !== null && detailCode !== standardDetail.detailCode) {
            data.detailCode = detailCode;
        }
        if (detailOrder !== null && detailOrder !== standardDetail.detailOrder) {
            data.detailOrder = detailOrder;
        }
        const isActived: boolean = isActive === "true";
        if (isActived !== null && isActived !== standardDetail.isActive) {
            data.isActive = isActived;
        }

        if (Object.keys(data).length === 0) {
            return sendErrorResponse(c, 400, "No data provided to update");
        }
        const updatedStandardDetail: StandardDetails = await editStandardDetailService({ idStandardDetail }, data);
        return sendSuccessResponse<StandardDetails>(c, 200, updatedStandardDetail, "Successfully update standard detail");
    },
);

//STANDARD DETAIL TYPE MANAGEMENT
standardRouter.get(
    "/template/:idStandardDetail/type",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get All Standard Detail Type',}},  
            summary: "Get All Standard Detail Type" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardDetailParamSchema),
    validateQuery(StandardDetailTypeQuerySchema),
    async (c) => {
        const { idStandardDetail } = c.req.valid("param");
        const { search, limit: pLimit } = c.req.valid("query");
        const where: Prisma.StandardDetailTypesWhereInput[] = [{ idStandardDetail, dateDeleted: null }];
        const limit: number = Number(pLimit) || 25;

        if (search) {
            where.push({
                OR: [
                    {
                        detailType: {
                            contains: search.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                    {
                        detailTypeCode: {
                            contains: search.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                ],
            });
        }

        const standardDetailType: StandardDetailTypes[] = await getAllStandardDetailTypeService(where, limit);
        return sendSuccessResponse<StandardDetailTypes[]>(c, 200, standardDetailType, "Successfully get all standard detail type");
    },
);

standardRouter.post(
    "/template/:idStandardDetail/type",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                201: {
            description: 'Add Standard Detail Type',}},  
            summary: "Add Standard Detail Type" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardDetailParamSchema),
    validateData(AddStandardDetailTypeSchema),
    async (c) => {
        const { idStandardDetail } = c.req.valid("param");
        const { detailType, detailTypeCode, detailTypeOrder } = c.req.valid("json");
        const standardDetailType: StandardDetailTypes = await addStandardDetailTypeService({
            standardDetail: { connect: { idStandardDetail } },
            detailType,
            detailTypeCode: detailTypeCode!,
            detailTypeOrder: detailTypeOrder!,
        });
        return sendSuccessResponse<StandardDetailTypes>(c, 201, standardDetailType, "Successfully add standard detail type");
    },
);

standardRouter.delete(
    "/template/:idStandardDetail/type/:idStandardDetailType",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Delete Standard Detail Type',}},  
            summary: "Delete Standard Detail Type" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardTemplateTypeParamSchema),
    async (c) => {
        const { idStandardDetailType, idStandardDetail } = c.req.valid("param");

        const standardDetailType: StandardDetailTypes | null = await getStandardDetailTypeWhereUniqueService({
            idStandardDetailType,
            idStandardDetail,
        });

        if (!standardDetailType || standardDetailType.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard detail type not found");
        }

        const deletedStandardDetailType: StandardDetailTypes = await deleteStandardDetailTypeService({ idStandardDetailType });

        return sendSuccessResponse<StandardDetailTypes>(c, 200, deletedStandardDetailType, "Successfully delete standard detail type");
    },
);

standardRouter.patch(
    "/template/:idStandardDetail/type/:idStandardDetailType",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Update Standard Detail Type',}},  
            summary: "Update Standard Detail Type" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardTemplateTypeParamSchema),
    validateData(UpdateStandardDetailTypeSchema),
    async (c) => {
        const { idStandardDetailType, idStandardDetail } = c.req.valid("param");
        const { detailType, detailTypeCode, isActive, detailTypeOrder } = c.req.valid("json");

        const standardDetailType: StandardDetailTypes | null = await getStandardDetailTypeWhereUniqueService({
            idStandardDetailType,
            idStandardDetail,
        });

        if (!standardDetailType || standardDetailType.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard detail type not found");
        }
        const data: Prisma.StandardDetailTypesUpdateInput = {};
        if (detailType !== standardDetailType.detailType) {
            data.detailType = detailType;
        }
        if (detailTypeCode !== standardDetailType.detailTypeCode) {
            data.detailTypeCode = detailTypeCode;
        }
        if (detailTypeOrder !== standardDetailType.detailTypeOrder) {
            data.detailTypeOrder = detailTypeOrder;
        }
        const isActived: boolean = isActive === "true";
        if (isActived !== null && isActived !== standardDetailType.isActive) {
            data.isActive = isActived;
        }
        if (Object.keys(data).length === 0) {
            return sendErrorResponse(c, 400, "No data provided to update");
        }
        const updatedStandardDetailType: StandardDetailTypes = await editStandardDetailTypeService(
            { idStandardDetailType, idStandardDetail },
            data,
        );
        return sendSuccessResponse<StandardDetailTypes>(c, 200, updatedStandardDetailType, "Successfully update standard detail type");
    },
);

//STANDARD DETAIL TYPE MANAGEMENT
standardRouter.get(
    "/template/:idStandardDetail/list",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get All Standard Detail Template',}},  
            summary: "Get All Standard Detail Template" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardDetailParamSchema),
    validateQuery(StandardTemplateQuerySchema),
    async (c) => {
        const { search, limit: pLimit } = c.req.valid("query");
        const { idStandardDetail } = c.req.valid("param");
        const standardType = await getAllStandardDetailTypeService(
            [
                {
                    idStandardDetail,
                },
            ],
            100,
        );
        const ids: string[] = standardType.map((i: StandardDetailTypes): string => i.idStandardDetailType);

        const where: Prisma.StandardTemplatesWhereInput[] = [
            {
                idStandardDetailType: {
                    in: ids,
                },
                dateDeleted: null,
            },
        ];
        const limit: number = Number(pLimit) || 25;
        if (search) {
            where.push({
                templateContent: {
                    contains: search.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }
        const standardTemplate: TStandardTemplatesWithType[] = await getAllStandardTemplateService(where, limit);
        return sendSuccessResponse<TStandardTemplatesWithType[]>(c, 200, standardTemplate, "Successfully get all standard template");
    },
);

standardRouter.post(
    "/template/:idStandardDetail/list",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                201: {
            description: 'Add Standard Template',}},  
            summary: "Add Standard Template" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardDetailParamSchema),
    validateData(AddStandardTemplateSchema),
    async (c) => {
        const { templateContent, idStandardDetailType, templateOrder } = c.req.valid("json");
        const standardTemplate: StandardTemplates = await addStandardTemplateService({
            standardDetailType: { connect: { idStandardDetailType } },
            templateContent,
            templateOrder: templateOrder!,
        });
        return sendSuccessResponse<StandardTemplates>(c, 201, standardTemplate, "Successfully add standard template");
    },
);

standardRouter.delete(
    "/template/:idStandardDetail/list/:idStandardTemplate",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Delete Standard Template',}},  
            summary: "Delete Standard Template" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardTemplateParamSchema),
    async (c) => {
        const { idStandardTemplate } = c.req.valid("param");

        const standardTemplate: StandardTemplates | null = await getStandardTemplateWhereUniqueService({
            idStandardTemplate,
        });

        if (!standardTemplate || standardTemplate.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard template not found");
        }

        const deletedStandardTemplate: StandardTemplates = await deleteStandardTemplateService({ idStandardTemplate });

        return sendSuccessResponse<StandardTemplates>(c, 200, deletedStandardTemplate, "Successfully delete standard template");
    },
);

standardRouter.patch(
    "/template/:idStandardDetail/list/:idStandardTemplate",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Update Standard Template',}},  
            summary: "Update Standard Template" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardTemplateParamSchema),
    validateData(UpdateStandardTemplateSchema),
    async (c) => {
        const { idStandardTemplate } = c.req.valid("param");
        const { templateContent, isActive, templateOrder, idStandardDetailType } = c.req.valid("json");

        const standardTemplate: StandardTemplates | null = await getStandardTemplateWhereUniqueService({
            idStandardTemplate,
        });

        if (!standardTemplate || standardTemplate.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard template not found");
        }

        const data: Prisma.StandardTemplatesUpdateInput = {};
        if (templateContent !== standardTemplate.templateContent) {
            data.templateContent = templateContent;
        }
        if (templateOrder !== standardTemplate.templateOrder) {
            data.templateOrder = templateOrder;
        }
        const isActived: boolean = isActive === "true";
        if (isActived !== null && isActived !== standardTemplate.isActive) {
            data.isActive = isActived;
        }

        if (idStandardDetailType !== standardTemplate.idStandardDetailType) {
            data.standardDetailType = { connect: { idStandardDetailType } };
        }

        if (Object.keys(data).length === 0) {
            return sendErrorResponse(c, 400, "No data provided to update");
        }
        const updatedStandardTemplate: StandardTemplates = await editStandardTemplateService({ idStandardTemplate }, data);
        return sendSuccessResponse<StandardTemplates>(c, 200, updatedStandardTemplate, "Successfully update standard template");
    },
);

//STANDARD MASTER DATA MANAGEMENT
standardRouter.get("/", requireLogin, describeRoute({ tags: ["Standard"], 
        responses: {
            200: {
        description: 'Get All Standard',}},  
        summary: "Get All Standard" }),
    
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT), validateQuery(StandardQuerySchema), async (c) => {
    const { page: pPage, limit: pLimit, sortBy, standardName, standardCode, isActive } = c.req.valid("query");
    const baseWhere: Prisma.StandardsWhereInput = { dateDeleted: null };
    const where: Prisma.StandardsWhereInput[] = [baseWhere];
    let orderBy: Prisma.StandardsOrderByWithRelationInput[] = [];
    let page: number = Number(pPage) || 1;
    let limit: number = Number(pLimit) || 10;
    let skip: number = (page - 1) * limit;

    if (standardName) {
        where.push({
            standardName: {
                contains: standardName.toLowerCase(),
                mode: "insensitive",
            },
        });
    }

    if (standardCode) {
        where.push({
            standardCode: {
                contains: standardCode.toLowerCase(),
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
        countAllStandardService({ where: [baseWhere] }),
        countAllStandardService({ where }),
        getAllStandardService(where, orderBy, skip, limit),
    ]);

    const dataWithOrderingNumber: TStandardWithOrderingNumber[] = dataStandard.map(
        (item: Standards, index: number): TStandardWithOrderingNumber => ({
            ...item,
            orderingNumber: index + 1,
        }),
    );

    const data: Pagination<TStandardWithOrderingNumber> = {
        page,
        limit,
        total,
        total_filtered,
        data: dataWithOrderingNumber,
    };

    return sendSuccessResponse<Pagination<TStandardWithOrderingNumber>>(c, 200, data, "Successfully get all standard");
});

standardRouter.post("/", requireLogin, describeRoute({ tags: ["Standard"], 
        responses: {
            201: {
        description: 'Add Standard',}},  
        summary: "Add Standard" }),
    
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT), validateData(AddStandardSchema), async (c) => {
    const { standardName, standardCode } = c.req.valid("json");
    const standard: Standards = await addStandardService({
        standardName,
        standardCode: standardCode!,
    });
    return sendSuccessResponse<Standards>(c, 201, standard, "Successfully add standard");
});

standardRouter.get(
    "/:idStandard",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Get Standard',}},  
            summary: "Get Standard" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardParamSchema),
    async (c) => {
        const { idStandard } = c.req.valid("param");

        const standard = await getStandardWhereUniqueService({ idStandard });

        if (!standard || standard.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard not found");
        }
        return sendSuccessResponse<Standards>(c, 200, standard, "Successfully get standard");
    },
);

standardRouter.delete(
    "/:idStandard",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Delete Standard',}},  
            summary: "Delete Standard" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardParamSchema),
    async (c) => {
        const { idStandard } = c.req.valid("param");
        const standard: Standards | null = await getStandardWhereUniqueService({ idStandard });
        if (!standard || standard.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard not found");
        }
        const deletedStandard: Standards = await deleteStandardService({ idStandard });
        return sendSuccessResponse<Standards>(c, 200, deletedStandard, "Successfully delete standard");
    },
);

standardRouter.patch(
    "/:idStandard",
    requireLogin,
    describeRoute({ tags: ["Standard"], 
            responses: {
                200: {
            description: 'Update Standard',}},  
            summary: "Update Standard" }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(StandardParamSchema),
    validateData(UpdateStandardSchema),
    async (c) => {
        const { idStandard } = c.req.valid("param");
        const { standardName, standardCode, isActive } = c.req.valid("json");
        const standard: Standards | null = await getStandardWhereUniqueService({ idStandard });
        if (!standard || standard.dateDeleted) {
            return sendErrorResponse(c, 404, "Standard not found");
        }

        const data: Prisma.StandardsUpdateInput = {};
        if (standardName !== standard.standardName) {
            data.standardName = standardName;
        }
        if (standardCode !== null && standardCode !== standard.standardCode) {
            data.standardCode = standardCode;
        }

        const isActived: boolean = isActive === "true";
        if (isActived !== null && isActived !== standard.isActive) {
            data.isActive = isActived;
        }

        if (Object.keys(data).length === 0) {
            return sendErrorResponse(c, 400, "No data provided to update");
        }

        const updatedStandard: Standards = await editStandardService({ idStandard }, data);

        return sendSuccessResponse<Standards>(c, 200, updatedStandard, "Successfully update standard");
    },
);

export default standardRouter;