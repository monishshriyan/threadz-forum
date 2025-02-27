// lib/db.ts
import { PrismaClient } from "@prisma/client";
import "server-only";

const prisma = new PrismaClient(); // Basic, direct instantiation

export const db = prisma;