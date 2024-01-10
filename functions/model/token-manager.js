const { Address } = require("@runonbitcoin/nimble")

const GDN_TOKEN_ORIGIN = 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1'

class TokenManager {
    constructor (run) {
        this.run = run
    }

    async balance(addressStr) {
        const address = Address.fromString(addressStr)
        const inventory = await this._inventoryForOwnerAddress(address)

        const tokens = inventory
            .filter(j => j.constructor.origin === GDN_TOKEN_ORIGIN)
        let balance = tokens.map(j => j.amount).reduce((a, b) => a + b, 0)
        return { balance, address: address.toString() }
    }

    async _inventoryForOwnerAddress(address) {
        const utxos = await this.run.blockchain.utxos(address.toScript().toHex())
        const maxedUtxos = utxos.slice(0, 100) // Maxed out to 100. TODO: Make this configurable
        const locations = maxedUtxos.map(u => `${u.txid}_o${u.vout}`)
        const maybeJigs = await Promise.all(locations.map(async loc => this._load(loc)))
        return maybeJigs.filter(a => a)
    }

    async _load(location) {
        try {
            return this.run.load(location)
        } catch (e) {
            if (e.message === "Not a RUN transaction: invalid OP_RETURN protocol") {
                return null
            } else {
                throw e
            }
        }
    }

    send () {
        throw new Error('not implemented yet')
    }
}

function buildTokenManager(run) {
    return new TokenManager(run)
}

module.exports = { TokenManager, buildTokenManager }