import { Hono } from "hono";
import { protectUnitAndTypeCombo, requireLogin, validateData, validateParams, validateQuery } from "../middlewares/auth.middleware.js";
import { SAM_WITH_PPM_UNIT } from "../configs/protect-role.config.js";
import { AddUnitSchema, UnitLimitQuerySchema, UnitParamSchema, UnitQuerySchema, UpdateUnitSchema } from "../validations/unit.validation.js";
import type { Prisma, Units } from "../generated/prisma/index.js";
import {
    addUnitService,
    countAllUnitService,
    deleteUnitService,
    editUnitService,
    getAllUnitLimitService,
    getAllUnitService,
    getUnitWhereUniqueService,
} from "../services/unit.service.js";
import type { TUnitWithSupervisor, TUnitWithSupervisorWithOrderingNumber, TUnitWithUserAndSupervisor } from "../types/unit.js";
import type { Pagination } from "../types/pagination.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/api-response.js";
import { describeRoute } from "hono-openapi";

const unitRouter = new Hono();

//UNIT MANAGEMENT
unitRouter.get("/",
    requireLogin,
    describeRoute({
        tags: ["Unit"],
        summary: "Get units",
        responses: {
            200: { description: "Successfully get all unit" }
        }
    }), protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT), validateQuery(UnitQuerySchema), async (c) => {
        const { page: pPage, limit: pLimit, sortBy, unitName, unitCode, supervisorName, isActive } = c.req.valid("query");
        const baseWhere: Prisma.UnitsWhereInput = { dateDeleted: null };
        const where: Prisma.UnitsWhereInput[] = [baseWhere];
        let orderBy: Prisma.UnitsOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (unitName) {
            where.push({
                unitName: {
                    contains: unitName.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }
        if (unitCode) {
            where.push({
                unitCode: {
                    contains: unitCode.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }

        if (supervisorName) {
            where.push({
                supervisor: {
                    name: {
                        contains: supervisorName.toLowerCase(),
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
            countAllUnitService({ where: [baseWhere] }),
            countAllUnitService({ where }),
            getAllUnitService(where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TUnitWithSupervisorWithOrderingNumber[] = dataStandard.map(
            (item: TUnitWithSupervisor, index: number): TUnitWithSupervisorWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TUnitWithSupervisorWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TUnitWithSupervisorWithOrderingNumber>>(c, 200, data, "Successfully get all unit");
    });

unitRouter.post("/",
    requireLogin,
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    describeRoute({
        tags: ["Unit"],
        summary: "Add units",
        responses: {
            201: { description: "Successfully add unit" }
        }
    }), validateData(AddUnitSchema), async (c) => {
        const { unitName, unitCode, supervisorId } = c.req.valid("json");

        const unit: Units = await addUnitService({
            unitName,
            unitCode: unitCode!,
            ...(supervisorId && {
                supervisor: {
                    connect: {
                        idUser: supervisorId,
                    },
                },
            }),
        });
        return sendSuccessResponse<Units>(c, 201, unit, "Successfully add unit");
    });

unitRouter.get("/lists",
    requireLogin,
    describeRoute({
        tags: ["Unit"],
        summary: "Search Unit",
        responses: {
            200: { description: "Successfully get all unit" }
        }
    }), validateQuery(UnitLimitQuerySchema), async (c) => {
        const { search, limit: pLimit } = c.req.valid("query");
        const where: Prisma.UnitsWhereInput[] = [{ dateDeleted: null }];
        const limit: number = Number(pLimit) || 100;

        if (search) {
            where.push({
                OR: [
                    {
                        unitName: {
                            contains: search.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                    {
                        unitCode: {
                            contains: search.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                ],
            });
        }

        const units: Units[] = await getAllUnitLimitService(where, limit);
        return sendSuccessResponse<Units[]>(c, 200, units, "Successfully get all unit");
    });

unitRouter.get("/:idUnit",
    requireLogin,
    describeRoute({
        tags: ["Unit"],
        summary: "Get Id Unit",
        responses: {
            200: { description: "Successfully get unit" },
            404: { description: "Unit not found" }
        }
    }), protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(UnitParamSchema), async (c) => {
        const { idUnit } = c.req.valid("param");

        const unit: TUnitWithUserAndSupervisor | null = await getUnitWhereUniqueService({ idUnit });

        if (!unit || unit.dateDeleted) {
            return sendErrorResponse(c, 404, "Unit not found");
        }
        return sendSuccessResponse<TUnitWithUserAndSupervisor>(c, 200, unit, "Successfully get unit");
    });

unitRouter.delete("/:idUnit",
    requireLogin,
    describeRoute({
        tags: ["Unit"],
        summary: "Delete units",
        responses: {
            200: { description: "Successfully delete unit" },
            404: { description: "Unit not found" }
        }
    }), protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(UnitParamSchema),
    async (c) => {
        const { idUnit } = c.req.valid("param");

        const unit: Units | null = await getUnitWhereUniqueService({ idUnit });
        if (!unit || unit.dateDeleted) {
            return sendErrorResponse(c, 404, "Unit not found");
        }
        const deletedUnit: Units = await deleteUnitService({ idUnit });
        return sendSuccessResponse<Units>(c, 200, deletedUnit, "Successfully delete unit");
    });

unitRouter.patch(
    "/:idUnit",
    requireLogin,
    describeRoute({
        tags: ["Unit"],
        summary: "Update units",
        responses: {
            200: { description: "Successfully update unit" },
            400: { description: "No data provided to update" },
            404: { description: "Unit not found" }
        }
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(UnitParamSchema),
    validateData(UpdateUnitSchema),
    async (c) => {
        const { idUnit } = c.req.valid("param");
        const { unitName, unitCode, isActive, supervisorId } = c.req.valid("json");
        const unit: Units | null = await getUnitWhereUniqueService({ idUnit });
        if (!unit || unit.dateDeleted) {
            return sendErrorResponse(c, 404, "Unit not found");
        }
        const data: Prisma.UnitsUpdateInput = {};
        if (unitName !== unit.unitName) {
            data.unitName = unitName;
        }
        if (unitCode !== null && unitCode !== unit.unitCode) {
            data.unitCode = unitCode;
        }
        const isActived: boolean = isActive === "true";
        if (isActived !== null && isActived !== unit.isActive) {
            data.isActive = isActived;
        }
        if (supervisorId !== null && supervisorId !== unit.supervisorId) {
            data.supervisor = {
                connect: {
                    idUser: supervisorId,
                },
            };
        }
        if (Object.keys(data).length === 0) {
            return sendErrorResponse(c, 400, "No data provided to update");
        }
        const updatedUnit: Units = await editUnitService({ idUnit }, data);
        return sendSuccessResponse<Units>(c, 200, updatedUnit, "Successfully update unit");
    },
);

export default unitRouter;
