const { Op } = require("sequelize");
const districtModel = require("../models/districts");
const stateModel = require("../models/states");
const talukaModel = require("../models/talukas");
const userModel = require("../models/users");
const villageModel = require("../models/villages");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

const createUser = async (req, res) => {
    try {
        const { name, phone, userType, assignedStates, assignedDistricts, assignedTalukas, assignedVillages } = req.body;

        let password = Math.floor(Math.random() * 100000000).toString();
        const user = await userModel.create({
            name,
            phone,
            password,
            userType: userType,
            organisationId: req.user.organisationId,
            assignedStates: assignedStates || [],
            assignedDistricts: assignedDistricts || [],
            assignedTalukas: assignedTalukas || [],
            assignedVillages: assignedVillages || []
        })

        let promises = [];

        if (user.assignedStates && user.assignedStates.length > 0) {
            promises.push(stateModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedStates
                    }
                },
            }).then(states => {
                user.assignedStates = states;
            }));
        }

        if (user.assignedDistricts && user.assignedDistricts.length > 0) {
            promises.push(districtModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedDistricts
                    }
                },
            }).then(districts => {
                user.assignedDistricts = districts;
            }));
        }

        if (user.assignedTalukas && user.assignedTalukas.length > 0) {
            promises.push(talukaModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedTalukas
                    }
                },
            }).then(talukas => {
                user.assignedTalukas = talukas;
            }));
        }

        if (user.assignedVillages && user.assignedVillages.length > 0) {
            promises.push(villageModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedVillages
                    }
                },
            }).then(villages => {
                user.assignedVillages = villages;
            }));
        }

        await Promise.all(promises);
        myCache.del("users-"+req.user.organisationId);

        return res.status(201).json({
            status: true,
            message: "User created successfully",
            statusCode: 201,
            data: user,
            error: null
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const update = async (req, res) => {
    try {
        const { name, phone, userType, password, assignedStates, assignedDistricts, assignedTalukas, assignedVillages } = req.body;

        let id = req.params.id;

        id = parseInt(id);

        if (req.user.userType !== 'admin' && req.user.id != id) {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        const user = await userModel.findOne({
            where: {
                id,
                isDeleted: false,
                organisationId: req.user.organisationId
            }
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;

        if (req.user.userType === 'admin') {
            user.userType = userType || user.userType;
            user.password = password || user.password;
            user.assignedStates = assignedStates || user.assignedStates;
            user.assignedDistricts = assignedDistricts || user.assignedDistricts;
            user.assignedTalukas = assignedTalukas || user.assignedTalukas;
            user.assignedVillages = assignedVillages || user.assignedVillages;
        }

        await user.save();

        let promises = [];

        if (user.assignedStates && user.assignedStates.length > 0) {
            promises.push(stateModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedStates
                    }
                },
            }).then(states => {
                user.assignedStates = states;
            }));
        }

        if (user.assignedDistricts && user.assignedDistricts.length > 0) {
            promises.push(districtModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedDistricts
                    }
                },
            }).then(districts => {
                user.assignedDistricts = districts;
            }));
        }

        if (user.assignedTalukas && user.assignedTalukas.length > 0) {
            promises.push(talukaModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedTalukas
                    }
                },
            }).then(talukas => {
                user.assignedTalukas = talukas;
            }));
        }

        if (user.assignedVillages && user.assignedVillages.length > 0) {
            promises.push(villageModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedVillages
                    }
                },
            }).then(villages => {
                user.assignedVillages = villages;
            }));
        }

        await Promise.all(promises);

        myCache.del("users-" + req.user.organisationId);

        return res.status(200).json({
            status: true,
            message: "User updated successfully",
            statusCode: 200,
            data: user,
            error: null
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        let id = req.params.id;

        id = parseInt(id)

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }



        const user = await userModel.findOne({
            where: {
                id,
                isDeleted: false,
                organisationId: req.user.organisationId
            }
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        user.isDeleted = true;
        await user.save();
        myCache.del("users-" + req.user.organisationId);
        return res.status(200).json({
            status: true,
            message: "User deleted successfully",
            statusCode: 200,
            data: null,
            error: null
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const getUsers = async (req, res) => {
    try {

        if(myCache.has("users-" + req.user.organisationId)){
            return res.status(200).json({
                status: true,
                message: "Users retrieved successfully",
                statusCode: 200,
                data: JSON.parse(myCache.get("users-" + req.user.organisationId)),
                error: null
            });
        }

        let users = await userModel.findAll({
            where: {
                isDeleted: false,
                organisationId: req.user.organisationId
            }
        });

        let promises = []

        users = users.map(user => {
            user = user.toJSON();
            if (user.assignedStates && user.assignedStates.length > 0) {
                promises.push(stateModel.findAll({
                    where: {
                        id: {
                            [Op.in]: user.assignedStates
                        }
                    },

                }).then(states => {
                    user.assignedStates = states;
                }));
            }

            if (user.assignedDistricts && user.assignedDistricts.length > 0) {
                promises.push(districtModel.findAll({
                    where: {
                        id: {
                            [Op.in]: user.assignedDistricts
                        }
                    },

                }).then(districts => {
                    user.assignedDistricts = districts;
                }));
            }

            if (user.assignedTalukas && user.assignedTalukas.length > 0) {
                promises.push(talukaModel.findAll({
                    where: {
                        id: {
                            [Op.in]: user.assignedTalukas
                        }
                    },

                }).then(talukas => {
                    user.assignedTalukas = talukas;
                }));
            }

            if (user.assignedVillages && user.assignedVillages.length > 0) {
                promises.push(villageModel.findAll({
                    where: {
                        id: {
                            [Op.in]: user.assignedVillages
                        }
                    },

                }).then(villages => {
                    user.assignedVillages = villages;
                }));
            }
            return user
        })

        await Promise.all(promises);

        myCache.set( "users-" + req.user.organisationId, JSON.stringify(users), 1000000 );

        return res.status(200).json({
            status: true,
            message: "Users retrieved successfully",
            statusCode: 200,
            data: users,
            error: null
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const getUser = async (req, res) => {
    try {
        let id = req.params.id;

        id = parseInt(id)

        if (req.user.userType !== 'admin' && req.user.id !== id) {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        let user = await userModel.findOne({
            where: {
                id,
                isDeleted: false,
                organisationId: req.user.organisationId
            }
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        user = user.toJSON();
        let promises = [];

        if (user.assignedStates && user.assignedStates.length > 0) {
            promises.push(stateModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedStates
                    }
                },
            }).then(states => {
                user.assignedStates = states;
            }));
        }

        if (user.assignedDistricts && user.assignedDistricts.length > 0) {
            promises.push(districtModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedDistricts
                    }
                },
            }).then(districts => {
                user.assignedDistricts = districts;
            }));
        }

        if (user.assignedTalukas && user.assignedTalukas.length > 0) {
            promises.push(talukaModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedTalukas
                    }
                },
            }).then(talukas => {
                user.assignedTalukas = talukas;
            }));
        }

        if (user.assignedVillages && user.assignedVillages.length > 0) {
            promises.push(villageModel.findAll({
                where: {
                    id: {
                        [Op.in]: user.assignedVillages
                    }
                },
            }).then(villages => {
                user.assignedVillages = villages;
            }));
        }

        await Promise.all(promises);

        return res.status(200).json({
            status: true,
            message: "User retrieved successfully",
            statusCode: 200,
            data: user,
            error: null
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

module.exports = {
    createUser,
    update,
    deleteUser,
    getUsers,
    getUser
}

