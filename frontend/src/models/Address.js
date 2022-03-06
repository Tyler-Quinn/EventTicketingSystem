import { utils } from 'ethers'

class Address {
    constructor(address) {
        let _address
        if (address instanceof Address) {
            _address = address.toString()
        } else if (typeof address === 'string') {
            _address = utils.getAddress(address)
        }

        if (!_address || !utils.isAddress(_address)) {
            throw new Error('Invalid address')
        }

        this.address = _address
    }
    
    static from(address) {
        return new Address(address)
    }

    toString() {
        return this.address
    }

    truncate() {
        return this.address.slice(0, 6) + '...' + this.address.slice(38, 42)
    }

    toLowercase() {
        return this.address.toLowerCase()
      }
    
      eq(address) {
        return new Address(address).toLowercase() === this.toLowercase()
      }
}

export default Address