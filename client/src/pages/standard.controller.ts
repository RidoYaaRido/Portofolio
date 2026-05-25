import { Hono } from "hono";
import { protectUnitAndTypeCombo, requireLogin, validateData, validateParams, validateQuery } from "../middlewares/auth.middleware.js";
import { SAM_WITH_PPM_UNIT } from "../configs/protect-role.config.js";
import {
    AddReferenceSchema,
    ReferenceActiveQuerySchema,
    ReferenceParamSchema,
    ReferenceQuerySchema,
    UpdateReferenceSchema,
} from "../validations/reference.validation.js";
import type { Prisma, References } from "../generated/prisma/index.js";
import {
    addReferenceService,
    countAllReferenceService,
    deleteReferenceService,
    editReferenceService,
    getAllActiveReferenceService,
    getAllReferenceService,
    getReferenceWhereUniqueService,
} from "../services/reference.service.js";
import type { TReferenceWithOrderingNumber } from "../types/reference.js";
import type { Pagination } from "../types/pagination.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/api-response.js";
import { describeRoute } from "hono-openapi";

const referenceRouter = new Hono();

//REFERENCE MANAGEMENT
referenceRouter.get(
    "/",
    requireLogin,
    describeRoute({
        tags: ["Reference"],
        responses: {
            200: {
                description: 'Successfully get all references',
            }
        },
        summary: "Get All References"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateQuery(ReferenceQuerySchema),
    async (c) => {
        const { page: pPage, limit: pLimit, sortBy, referenceName, referenceType, isActive } = c.req.valid("query");
        const baseWhere: Prisma.ReferencesWhereInput = { dateDeleted: null };
        const where: Prisma.ReferencesWhereInput[] = [baseWhere];
        let orderBy: Prisma.ReferencesOrderByWithRelationInput[] = [];
        let page: number = Number(pPage) || 1;
        let limit: number = Number(pLimit) || 10;
        let skip: number = (page - 1) * limit;

        if (referenceName) {
            where.push({
                referenceName: {
                    contains: referenceName.toLowerCase(),
                    mode: "insensitive",
                },
            });
        }
        if (referenceType) {
            where.push({
                referenceType: referenceType,
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
        const [total, total_filtered, dataReference] = await Promise.all([
            countAllReferenceService({ where: [baseWhere] }),
            countAllReferenceService({ where }),
            getAllReferenceService(where, orderBy, skip, limit),
        ]);

        const dataWithOrderingNumber: TReferenceWithOrderingNumber[] = dataReference.map(
            (item: References, index: number): TReferenceWithOrderingNumber => ({
                ...item,
                orderingNumber: index + 1,
            }),
        );

        const data: Pagination<TReferenceWithOrderingNumber> = {
            page,
            limit,
            total,
            total_filtered,
            data: dataWithOrderingNumber,
        };

        return sendSuccessResponse<Pagination<TReferenceWithOrderingNumber>>(c, 200, data, "Successfully get all reference");
    }
);

referenceRouter.get(
    "/lists",
    requireLogin,
    describeRoute({
        tags: ["Reference"],
        responses: {
            200: {
                description: 'Successfully get all references',
            }
        },
        summary: "Search References"
    }),
    validateQuery(ReferenceActiveQuerySchema),
    async (c) => {
        const { search, limit: pLimit } = c.req.valid("query");
        const where: Prisma.ReferencesWhereInput[] = [];
        const limit: number = Number(pLimit) || 10;

        if (search) {
            where.push({
                OR: [
                    {
                        referenceName: {
                            contains: search.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                    {
                        referenceLink: {
                            contains: search.toLowerCase(),
                            mode: "insensitive",
                        },
                    },
                ],
            });
        }
        const references: References[] = await getAllActiveReferenceService(where, limit);
        return sendSuccessResponse<References[]>(c, 200, references, "Successfully get all references");
    }
);

referenceRouter.post(
    "/",
    requireLogin,
    describeRoute({
        tags: ["Reference"],
        responses: {
            200: {
                description: 'Successfully add reference',
            }
        },
        summary: "Add Reference"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateData(AddReferenceSchema),
    async (c) => {
        const { referenceName, referenceType, referenceLink } = c.req.valid("json");
        const reference: References = await addReferenceService({
            referenceName,
            referenceType,
            referenceLink,
        });
        return sendSuccessResponse<References>(c, 201, reference, "Successfully add reference");
    }
);

referenceRouter.get(
    "/:idReference",
    requireLogin,
    describeRoute({
        tags: ["Reference"],
        responses: {
            200: {
                description: 'Successfully get reference',
            }
        },
        summary: "Get Reference"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ReferenceParamSchema),
    async (c) => {
        const { idReference } = c.req.valid("param");
        const reference: References | null = await getReferenceWhereUniqueService({ idReference });
        if (!reference || reference.dateDeleted) {
            return sendErrorResponse(c, 404, "Reference not found");
        }
        return sendSuccessResponse<References>(c, 200, reference, "Successfully get reference");
    }
);

referenceRouter.delete(
    "/:idReference",
    requireLogin,
    describeRoute({
        tags: ["Reference"],
        responses: {
            200: {
                description: 'Successfully delete reference',
            }
        },
        summary: "Delete Reference"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ReferenceParamSchema),
    async (c) => {
        const { idReference } = c.req.valid("param");
        const reference: References | null = await getReferenceWhereUniqueService({ idReference });
        if (!reference || reference.dateDeleted) {
            return sendErrorResponse(c, 404, "Reference not found");
        }
        const deletedReference: References = await deleteReferenceService({ idReference });
        return sendSuccessResponse<References>(c, 200, deletedReference, "Successfully delete reference");
    }
);

referenceRouter.patch(
    "/:idReference",
    requireLogin,
    describeRoute({
        tags: ["Reference"],
        responses: {
            200: {
                description: 'Successfully update reference',
            }
        },
        summary: "Update Reference"
    }),
    protectUnitAndTypeCombo(SAM_WITH_PPM_UNIT),
    validateParams(ReferenceParamSchema),
    validateData(UpdateReferenceSchema),
    async (c) => {
        const { idReference } = c.req.valid("param");
        const { referenceName, referenceType, referenceLink, isActive } = c.req.valid("json");
        const reference: References | null = await getReferenceWhereUniqueService({ idReference });

        if (!reference || reference.dateDeleted) {
            return sendErrorResponse(c, 404, "Reference not found");
        }

        const data: Prisma.ReferencesUpdateInput = {};
        if (referenceName !== reference.referenceName) {
            data.referenceName = referenceName;
        }
        if (referenceType !== reference.referenceType) {
            data.referenceType = referenceType;
        }
        if (referenceLink !== reference.referenceLink) {
            data.referenceLink = referenceLink;
        }
        const isActived: boolean = isActive === "true";
        if (isActived !== null && isActived !== reference.isActive) {
            data.isActive = isActived;
        }

        if (Object.keys(data).length === 0) {
            return sendErrorResponse(c, 400, "No data provided to update");
        }
        const updatedReference: References = await editReferenceService({ idReference }, data);
        return sendSuccessResponse<References>(c, 200, updatedReference, "Successfully update reference");
    }
);

export default referenceRouter;