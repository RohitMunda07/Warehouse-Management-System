import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getAllShipments,
    createShipment,
    getShipmentById,
    updateShipment,
    deleteShipment,
} from "../controllers/Shipment.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getAllShipments);
router.post("/", createShipment);
router.get("/:id", getShipmentById);
router.put("/:id", updateShipment);
router.delete("/:id", deleteShipment);

export default router;
