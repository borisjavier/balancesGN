const { Address, PrivateKey } = require("@runonbitcoin/nimble")

const GDN_TOKEN_ORIGIN = 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1'

class TokenManager {
    constructor (run) {
        this.run = run
    }

    async balance (addr) {
        const tokens = await this._tokensForOwnerAddress(addr)
        let balance = tokens.map(j => j.amount).reduce((a, b) => a + b, 0)
        return { balance, address: addr.toString() }
    }

    async _tokensForOwnerAddress (address) {
        const utxos = await this.run.blockchain.utxos(address.toScript().toHex())
        const maxedUtxos = utxos.slice(0, 100) // Maxed out to 100. TODO: Make this configurable
        const locations = maxedUtxos.map(u => `${u.txid}_o${u.vout}`)
        const maybeJigs = await Promise.all(locations.map(async loc => this._load(loc)))
        let jigs = maybeJigs.filter(a => a)
        return jigs
            .filter(j => j.constructor.origin === GDN_TOKEN_ORIGIN)
    }

    async send (ownerPk, pursePk, receiverAddress, amount) {
        const ownerAddress = ownerPk.toAddress()
        const tokens = await this._tokensForOwnerAddress(ownerAddress)

        const tokensToUse = []
        let sum = 0

        for (const token of tokens) {
            tokensToUse.push(token)
            sum += token.amount

            if (sum >= amount) {
                break
            }
        }

        if (sum < amount) {
            throw new GnError("Not enough token balance", 400, {
                senderAddr: ownerAddress.toString(),
                currentBalance: sum,
                amountToSend: amount
            })
        }

        this.run.purse = pursePk.toString()
        this.run.owner = ownerPk.toString()

        let newJig
        this.run.transaction(() => {
            const jig = tokensToUse[0]
            if (tokensToUse.length > 1) {
                jig.combine(tokensToUse.slice(1))
            }
            newJig = jig.send(receiverAddress.toString(), amount)
        })

        await this.run.sync()

        const [txid, vout] = newJig.location.split('_o')
        return { txid, vout }
    }

    async _load (location) {
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

}

function buildTokenManager (run) {
    return new TokenManager(run)
}

module.exports = { TokenManager, buildTokenManager }