const { Op } = require('sequelize')

const getContractById = async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const { id: profileId } = req.profile

    const contract = await Contract.findOne({
        where: {
            [Op.and]: [
                {id},
                {
                    [Op.or]: [
                        {ContractorId: profileId},
                        {ClientId: profileId}
                    ]
                }
            ]
        }
    })

    if (!contract) { 
        return res.status(404).json({ error: "No contract have been found" })
    }

    res.status(200).json(contract)
}

const getContracts = async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id: profileId } = req.profile

    const contracts = await Contract.findAll({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [
                        {ContractorId: profileId},
                        {ClientId: profileId}
                    ]
                },
                {
                    status: {
                        [Op.notIn]: ['terminated']
                    }
                }
            ]
        }
    })

    if (contracts.length === 0) {
        return res.status(404).json({ error: "No contracts have been found" })
    }

    res.status(200).json(contracts)
}

module.exports = {
    getContractById,
    getContracts
}