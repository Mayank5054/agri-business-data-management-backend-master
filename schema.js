let organisationSchema = {
    id,
    name,
    address,
    contactPersonName,
    contactPersonNumber,
    isActive,
    createdAt,
    updatedAt,
    isDeleted
}

let userSchema = {
    id,
    organisationId,
    name,
    phone,
    password,
    createdAt,
    updatedAt,
    isActive,
    isDeleted,
    isAdmin,
}

let statesSchema = {
    id,
    name,
}

let districtsSchema = {
    id,
    name,
    stateId,
}

let talukasSchema = {
    id,
    name,
    districtId,
    stateId,
}

let villagesSchema = {
    id,
    name,
    talukaId,
    districtId,
    stateId,
}

let userStatesSchema = {
    id,
    userId,
    stateId,
}

let userDistrictsSchema = {
    id,
    userId,
    districtId,
}

let userTalukasSchema = {
    id,
    userId,
    talukaId,
}

let userVillagesSchema = {
    id,
    userId,
    villageId,
}