const express = require('express')
const logger = require("firebase-functions/logger")

const TRUSTED = ['faeff1aa95043157b02f0ea61c94f8cb27f30eea57fd01626b64af9fd7ab29ff_o1', '3ba617b9adf0ad3730d05c5a0bc10442182917823865e7c7e4a613a70ab14089']

function buildRoutes(run, logger) {
    const app = express()

    async function balanceFor(privateKey) {
        run.owner = privateKey
        await run.inventory.sync()
        console.log(run.inventory.jigs.length)
        const jigs = run.inventory.jigs
            .filter(j => TRUSTED.includes(j.constructor.location))
        return jigs.map(j => j.amount).reduce((a, b) => a + b, 0)
    }

    app.get('/cuenta1', async (req, res) => {
        res.json({balance: await balanceFor('L5dGUVnAKNf3FYwgzh3Lb8wkPGpqrDDyWUthcwJYUGuLxHMvtFuF')})
    })

    app.get('/cuenta2', async (req, res) => {
        res.json({balance: await balanceFor('L5UpCrzQfXtjmNKax62qH6yJfczMpcdgCKeK9nHvW25QQoLdB8e2')})
    })

    app.get('/cuenta3', async (req, res) => {
        res.json({balance: await balanceFor('L1XAKaZEqDPafgF3WRaxZM1jDpc7Dd331UjohQ2T5X1WCiTFy9dK')})
    })

    return app
}

module.exports =  { buildRoutes }