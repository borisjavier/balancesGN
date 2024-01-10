const express = require('express')
const { Address } = require('@runonbitcoin/nimble')
const bodyParser = require('body-parser')
const { load } = require("../model/run")

const GDN_TOKEN_ORIGIN = 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1'

function buildRoutes (run, logger) {
    const app = express()
    app.use(bodyParser.json())

    async function balanceFor (rawAddress) {
        const address = Address.fromString(rawAddress)
        const utxos = await run.blockchain.utxos(address.toScript().toHex())
        const locations = utxos.map(u => `${u.txid}_o${u.vout}`)
        const maybeJigs = await Promise.all(locations.map(async loc => load(run, loc)))
        const jigs = maybeJigs.filter(a => a)

        const tokens = jigs
            .filter(j => j.constructor.origin === GDN_TOKEN_ORIGIN)
        let balance = tokens.map(j => j.amount).reduce((a, b) => a + b, 0)
        return { balance, address: address.toString() }
    }

    app.post('/balance', async (req, res) => {
        const body = req.body
        const ownerAddress = body.ownerAddress
        res.json(await balanceFor(ownerAddress))
    })

    app.post('/send', async (req, res) => {
        throw new Error('not implemented yer')
    })

    return app
}

module.exports = { buildRoutes }