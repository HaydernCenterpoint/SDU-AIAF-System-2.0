-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "avatar_url" TEXT,
    "role" VARCHAR(20) NOT NULL DEFAULT 'student',
    "account_type" VARCHAR(40) NOT NULL DEFAULT 'university_student',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "student_code" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(30),
    "major" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "height_cm" DOUBLE PRECISION,
    "birth_year" INTEGER,
    "gender" VARCHAR(30),
    "activity_level" VARCHAR(40),
    "water_goal_ml" INTEGER NOT NULL DEFAULT 2000,
    "calorie_goal" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "bmi_value" DOUBLE PRECISION,
    "bmi_category" VARCHAR(30),
    "note" TEXT,
    "logged_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sleep_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sleep_date" DATE NOT NULL,
    "duration_hours" DOUBLE PRECISION NOT NULL,
    "quality" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sleep_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "meal_date" DATE NOT NULL,
    "meal_type" VARCHAR(40) NOT NULL,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_items" (
    "id" UUID NOT NULL,
    "meal_log_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "protein_grams" DOUBLE PRECISION,
    "carbs_grams" DOUBLE PRECISION,
    "fat_grams" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nutrition_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "frequency" VARCHAR(80),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workout_date" DATE NOT NULL,
    "workout_type" VARCHAR(80) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "calories_burned" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mood_date" DATE NOT NULL,
    "mood_score" INTEGER NOT NULL,
    "stress_level" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "type" VARCHAR(40) NOT NULL,
    "remind_at" TIMESTAMPTZ(6) NOT NULL,
    "repeat_type" VARCHAR(20) NOT NULL DEFAULT 'none',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reminder_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "type" VARCHAR(40) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_student_code_key" ON "student_profiles"("student_code");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "health_profiles_user_id_key" ON "health_profiles"("user_id");

-- CreateIndex
CREATE INDEX "weight_logs_user_id_logged_at_idx" ON "weight_logs"("user_id", "logged_at");

-- CreateIndex
CREATE INDEX "sleep_logs_user_id_sleep_date_idx" ON "sleep_logs"("user_id", "sleep_date");

-- CreateIndex
CREATE INDEX "meal_logs_user_id_meal_date_idx" ON "meal_logs"("user_id", "meal_date");

-- CreateIndex
CREATE INDEX "nutrition_items_meal_log_id_idx" ON "nutrition_items"("meal_log_id");

-- CreateIndex
CREATE INDEX "workout_plans_user_id_idx" ON "workout_plans"("user_id");

-- CreateIndex
CREATE INDEX "workout_logs_user_id_workout_date_idx" ON "workout_logs"("user_id", "workout_date");

-- CreateIndex
CREATE INDEX "mood_logs_user_id_mood_date_idx" ON "mood_logs"("user_id", "mood_date");

-- CreateIndex
CREATE INDEX "reminders_user_id_remind_at_idx" ON "reminders"("user_id", "remind_at");

-- CreateIndex
CREATE INDEX "reminders_status_is_sent_remind_at_idx" ON "reminders"("status", "is_sent", "remind_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sleep_logs" ADD CONSTRAINT "sleep_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_items" ADD CONSTRAINT "nutrition_items_meal_log_id_fkey" FOREIGN KEY ("meal_log_id") REFERENCES "meal_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
