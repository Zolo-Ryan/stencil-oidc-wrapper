-- CreateTable
CREATE TABLE "Grant" (
    "id" TEXT NOT NULL,
    "val" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Grant_id_key" ON "Grant"("id");
