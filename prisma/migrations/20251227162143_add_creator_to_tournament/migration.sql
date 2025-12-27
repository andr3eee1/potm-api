-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tournament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statement" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "prizePool" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'N/A',
    "points" INTEGER NOT NULL DEFAULT 100,
    "creatorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tournament_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tournament" ("createdAt", "description", "difficulty", "endDate", "id", "points", "prizePool", "startDate", "statement", "status", "title", "updatedAt") SELECT "createdAt", "description", "difficulty", "endDate", "id", "points", "prizePool", "startDate", "statement", "status", "title", "updatedAt" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
