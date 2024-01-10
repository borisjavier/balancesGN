const express = require('express')
const logger = require("firebase-functions/logger")

const TRUSTED = ['a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1']

function buildRoutes (run, logger) {
    const app = express()

    async function balanceFor (privateKey) {
        run.owner = privateKey
        await run.inventory.sync()
        const jigs = run.inventory.jigs
            .filter(j => j.constructor.origin === 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1')
        return jigs.map(j => j.amount).reduce((a, b) => a + b, 0)
    }

    app.get('/cuenta1', async (req, res) => {
        // run.owner.address
        res.json({ balance: await balanceFor('L5dGUVnAKNf3FYwgzh3Lb8wkPGpqrDDyWUthcwJYUGuLxHMvtFuF'), address: run.owner.address })
    })

    app.get('/cuenta2', async (req, res) => {
        res.json({ balance: await balanceFor('L5UpCrzQfXtjmNKax62qH6yJfczMpcdgCKeK9nHvW25QQoLdB8e2') })
    })

    app.get('/cuenta3', async (req, res) => {
        res.json({ balance: await balanceFor('L1XAKaZEqDPafgF3WRaxZM1jDpc7Dd331UjohQ2T5X1WCiTFy9dK') })
    })

    app.get('/send-desde-cuenta-3', async (req, res) => {
        run.owner = 'L1XAKaZEqDPafgF3WRaxZM1jDpc7Dd331UjohQ2T5X1WCiTFy9dK'
        await run.inventory.sync()
        const jigs = run.inventory.jigs
            .filter(j => j.constructor.origin === 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1')

        const token = jigs[0]
        const address = "1HnhPzq6Zu3DLtRsmtVsvtpExdH77ziw6X"
        const otherToken = token.send(address)
        await token.sync()
        await otherToken.sync()
        res.json({ location: otherToken.location })

    })

    return app
}

module.exports = { buildRoutes }