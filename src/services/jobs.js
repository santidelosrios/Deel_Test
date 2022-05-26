const { Op, literal } = require('sequelize')

const getUnPaidJobs = async (req, res) => {
    const { Job, Contract } = req.app.get('models')
    const { id: profileId } = req.profile

    const jobs = await Job.findAll({
        include: {
            model: Contract, 
            as: 'Contract',
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            {ContractorId: profileId},
                            {ClientId: profileId}
                        ]
                    },
                    {
                        status: 'in_progress'
                    }
                ]
            }
        },
        where: { paid: null }
    })

    if (jobs.length === 0) {
        return res.status(404).json({ error: "No jobs have been found" })
    }

    return res.status(200).json(jobs)
}


const pay = async (req, res) => {
    const { Job, Contract, Profile } = req.app.get('models')
    const { balance, id: profileId } = req.profile
    const { id } = req.params

    const job = await Job.findOne({
        where: { id, paid: null }
    })

    if (!job) {
        return res.status(400).json({error: 'A job pending to be paid does not exist', success: false})
    }
    
    
    const amountToPay = job.price
    
    if (balance < amountToPay) {
        return res.status(400).json({error: 'Insufficient balance'})
    }

    const contract = await Contract.findOne({where: { id: job.ContractId }})

    if (contract.ClientId !== profileId) {
        //It means the caller of the endpoint is trying to pay a job that doesn not belong to them
        return res.status(400).json({error: 'The contract associated to this job does not belong to the user'})
    }
    try {
        await Job.update({ paid: true,  paymentDate: new Date() }, { where: { id } })
        await Profile.update({ balance: literal(`balance + ${amountToPay}`) }, { where: { id: contract.ContractorId } })
        await Profile.update({ balance: literal(`balance - ${amountToPay}`) }, { where: { id: profileId } })
    } catch (e) {
        return res.end(500).json({error: e})
    }

    return res.status(200).json({success: true})
}
module.exports = {
    getUnPaidJobs,
    pay
}

// 2 - 29.11
// 6 - 1416