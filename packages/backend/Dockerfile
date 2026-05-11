# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src

ENV PORT=9191
EXPOSE 9191

CMD ["npm", "run", "start"]
