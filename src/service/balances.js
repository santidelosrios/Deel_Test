const { Op, literal, fn, col } = require('sequelize')

const deposit = async (req, res) => {
    const { clientId: id } = req.params
    const { ammount } = req.body
    const { Job, Contract, Profile } = req.app.get('models')

    const profile = await Profile.findOne({where: { id: id, type: 'client' }})

    if (!ammount) {
        return res.status(400).json({ error: 'Should provide an ammount to deposit' }).end()
    }
    if (!profile) {
        return res.status(400).json({ error: 'Client does not exists' })
    }

    const totalJobsToPay = await Job.findAll({
        attributes: [[fn('sum', col('price')), 'total']],
        include: {
            model: Contract,
            as: 'Contract',
            where: {
                ClientId: id
            },
            require: false
        },
        where: {
            paid: null
        },
        raw: true
    })

    const depositLimit = totalJobsToPay[0].total * 0.25
    
    if (ammount > depositLimit) {
        return res.status(400).json({ error: "Can not deposit more than 25% of total amount to pay"})
    }

    try {
        await Profile.update({ balance: literal(`balance + ${ammount}`) }, { where: { id: id } })
    } catch(e) {
        return res.end(500).json({ error: e })
    }

    return res.status(200).json({})
}


module.exports = {
    deposit
}

/*
SELECT sum(price) as total
FROM Jobs
INNER JOIN Contracts as Contract ON Contract.id = Jobs.ContractId AND Contract.ContractorId = 7
WHERE paid is NULL
*/