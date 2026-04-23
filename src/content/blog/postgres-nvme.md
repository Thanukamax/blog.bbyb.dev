---
title: "A year of running Postgres on NVMe: what we learned the hard way."
description: "We moved our primary OLTP cluster to direct-attached NVMe. The gains were obvious, the foot-guns less so. A long-form retrospective with benchmarks."
topic: "Infrastructure"
authors: ["Elena Castellanos"]
authorInitials: ["EC"]
authorRoles: ["Principal Engineer, Storage"]
date: 2026-04-15
readTime: "14 min"
featured: false
---

We moved our primary OLTP cluster to direct-attached NVMe. The gains were obvious, the foot-guns less so. This is a long-form retrospective with benchmarks.
