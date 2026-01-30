# MVP Data Schema Definition

## 1. Purpose

This document defines the **data schema** for the Minimum Viable Product (MVP) of the requirements organization system. The schema supports:

- Structured requirement authoring  
- Enforced hierarchy and traceability  
- Lifecycle and governance control  

This schema is **business-driven**, **tool-agnostic**, and intended to be used as part of formal requirements documentation.

---

## 2. Design Principles

The schema is designed around the following principles:

1. **Strict hierarchy** – all entities must belong to a valid parent  
2. **Clear separation of concerns** – intent, rules, and verification are distinct  
3. **Lifecycle control** – items move through governed states  
4. **Audit-friendly metadata** – authorship and timestamps are preserved  
5. **Minimal sufficient scope** – only concepts required for core business value are included  

---

## 3. Hierarchical Model

The system enforces the following hierarchy:

```
Epic
 └── Story
      └── Acceptance Criterion
           └── Test Case
```

- Each child entity must have exactly one parent  
- Orphan entities are not allowed  
- Relationships are mandatory and enforced  

---

## 4. Entity Definitions

### 4.1 Epic

**Purpose**: Represents a high-level business capability or outcome.

**Schema**:

- `id` (UUID): System-generated unique identifier  
- `key` (string): Human-readable identifier  
- `title` (string): Short name of the epic  
- `description` (text): Detailed description of the capability  
- `status` (enum):  
  - Draft  
  - Approved  
  - Locked  
- `created_at` (datetime)  
- `created_by` (string)  
- `updated_at` (datetime)  
- `updated_by` (string)  

**Business Rules**:

- Epics SHALL exist independently  
- Locked epics SHALL NOT be editable  
- Stories SHALL reference a valid epic  

---

### 4.2 Story

**Purpose**: Represents functional intent expressed from a user or system perspective.

**Schema**:

- `id` (UUID)  
- `epic_id` (UUID): Reference to parent epic  
- `actor` (string)  
- `action` (text)  
- `outcome` (text)  
- `status` (enum):  
  - Draft  
  - Approved  
  - Locked  
- `created_at` (datetime)  
- `created_by` (string)  
- `updated_at` (datetime)  
- `updated_by` (string)  

**Business Rules**:

- A story SHALL belong to exactly one epic  
- Locked stories SHALL NOT be editable  
- Acceptance criteria SHALL reference a valid story  

---

### 4.3 Acceptance Criterion

**Purpose**: Represents a single, atomic, and verifiable rule that defines correctness.

**Schema**:

- `id` (UUID)  
- `story_id` (UUID): Reference to parent story  
- `given` (text)  
- `when` (text)  
- `then` (text)  
- `status` (enum):  
  - Draft  
  - Approved  
  - Locked  
- `valid` (boolean)  
- `risk` (enum):  
  - Low  
  - Medium  
  - High  
- `comments` (text)  
- `created_at` (datetime)  
- `created_by` (string)  
- `updated_at` (datetime)  
- `updated_by` (string)  

**Business Rules**:

- Each acceptance criterion SHALL define exactly one rule  
- Invalid acceptance criteria SHALL remain visible  
- Locked acceptance criteria SHALL NOT be editable  

---

### 4.4 Test Case

**Purpose**: Represents the procedure used to verify an acceptance criterion.

**Schema**:

- `id` (UUID)  
- `acceptance_criterion_id` (UUID): Reference to parent acceptance criterion  
- `preconditions` (text)  
- `steps` (text)  
- `expected_result` (text)  
- `priority` (enum):  
  - Low  
  - Medium  
  - High  
- `test_status` (enum):  
  - Not Run  
  - Pass  
  - Fail  
  - Blocked  
- `created_at` (datetime)  
- `created_by` (string)  
- `updated_at` (datetime)  
- `updated_by` (string)  

**Business Rules**:

- Test cases SHALL reference a valid acceptance criterion  
- Test execution status SHALL NOT alter requirement lifecycle state  

---

## 5. Schema Summary

| Entity | Purpose |
|------|--------|
| Epic | Business capability |
| Story | Functional intent |
| Acceptance Criterion | Verifiable rule |
| Test Case | Verification procedure |

---

## 6. Definition of Done (Schema-Level)

The schema is considered complete for MVP when:

- All entities enforce parent–child integrity  
- Lifecycle status is consistently applied  
- Traceability from epic to test case is guaranteed  
- The schema supports safe authoring and review  

---

## 7. One-Line Definition

> The MVP schema defines a strict, governed hierarchy from business intent to verification, enabling structured authoring and traceable validation.
