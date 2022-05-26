const express = require('express')
const bodyParser = require('body-parser')

const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const { getContractById, getContracts } = require('./service/contracts')
const { getUnPaidJobs, pay } = require('./service/jobs')
const { deposit } = require('./service/balances')
const { getBestProfession, getBestClients } = require('./service/admin')

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)


app.get('/contracts/:id', getProfile , getContractById)
app.get('/contracts', getProfile, getContracts)
app.get('/jobs/unpaid', getProfile, getUnPaidJobs)
app.post('/jobs/:id/pay', getProfile, pay)
// I am not sure *who* is supposed to call this enpodint, and therefore not sure if 
// I should add the getProfile middleware. My guess is that this enpodint would be
// called by a client to deposit money into their own account. But, in that case,
// we don't need the userId path param since that'd be available from the profile.
// Another option is that this endpoint can be called from an external caller and
// we would not need the middleware in that case.
// I will choose the second option to keep the definition like the README states
app.post('/balances/deposit/:clientId', deposit)
app.get('/admin/best-profession', getBestProfession)
app.get('/admin/best-clients', getBestClients)

module.exports = app;
