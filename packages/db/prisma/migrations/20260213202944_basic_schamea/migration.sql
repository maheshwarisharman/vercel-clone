-- CreateTable
CREATE TABLE "Project" (
    "project_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "github_url" TEXT NOT NULL,
    "installation_id" TEXT NOT NULL,
    "build_cmd" TEXT NOT NULL,
    "output_dir" TEXT NOT NULL,
    "build_branch" TEXT NOT NULL,
    "primary_domain" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "deployment_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_build_success" BOOLEAN NOT NULL,
    "preview_url" TEXT NOT NULL,
    "build_logs" TEXT NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("deployment_id")
);

-- CreateTable
CREATE TABLE "Project_ENV_Variables" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "env_variable" JSONB[],

    CONSTRAINT "Project_ENV_Variables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_ENV_Variables_project_id_key" ON "Project_ENV_Variables"("project_id");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_ENV_Variables" ADD CONSTRAINT "Project_ENV_Variables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
