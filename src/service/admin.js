const { Op, literal, fn, col } = require('sequelize')

const getBestProfession = async (req, res) => {
    const { start, end } = req.query
    const { Job, Contract, Profile } = req.app.get('models')

    const totalsByProfession = await Job.findAll({
        attributes: [[fn('sum', col('price')), 'totalByProfession'], 'Contract.Contractor.profession'],
        include: {
            model: Contract,
            as: 'Contract',
            require: false,
            include: {
                model: Profile,
                as: 'Contractor',
                required: false
            }
        },
        where: {
            [Op.and]: [
                { paid: true },
                { paymentDate: { [Op.gte]: start } },
                { paymentDate: { [Op.lte]: end } }
            ]
        },
        group: 'Contract.Contractor.profession',
        raw: true
    })

    if (totalsByProfession.length == 0) {
        return res.status(400).json({error: "No jobs have been paid in the queried period"})
    }

    const bestProfession = totalsByProfession.reduce((prev, current) => {
        return (prev.totalByProfession > current.totalByProfession) ? prev : current
    })


    return res.status(200).json({ result: bestProfession.profession })
}

const getBestClients = async (req, res) => {
    const { start, end, limit = 2 } = req.query
    const { Job, Contract, Profile } = req.app.get('models')

    const totalsByClient = await Job.findAll({
        attributes: [
            'Contract.Client.id', 
            [literal(`firstName || ' ' || lastName`), 'fullName'], 
            [fn('sum', col('price')), 'totalByClient'],
        ],
        include: {
            model: Contract,
            as: 'Contract',
            require: false,
            include: {
                model: Profile,
                as: 'Client',
                required: false
            }
        },
        where: {
            [Op.and]: [
                { paid: true },
                { paymentDate: { [Op.gte]: start } },
                { paymentDate: { [Op.lte]: end } }
            ]
        },
        group: 'Contract.Client.id',
        order: [[col('totalByClient'), 'DESC']],
        limit,
        raw: true
    })

    if (totalsByClient.length === 0) {
        return res.status(400).json({error: "No jobs have been paid in the queried period"})
    }

    const result = totalsByClient.map(item => {
        const { id, fullName, totalByClient: paid } = item
        return {
            id,
            fullName,
            paid
        }
    })

    return res.status(200).json({ result })
}

module.exports = {
    getBestProfession,
    getBestClients
}