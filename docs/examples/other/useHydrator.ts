import { CastingManager, ClassBuilder } from '@encolajs/hydrator'

// Setup core components
const castingManager = new CastingManager()
const builder = new ClassBuilder(castingManager)

// bug in the hydrator library, this needs to be defined before Order
const OrderItem = builder.newModelClass(
  {
    id: 'number',
    name: 'string',
    quantity: 'integer',
    price: 'decimal:2',
    total: 'decimal:2',
  },
  {},
  {
    _get_total: function () {
      try {
        return Math.round(this.quantity * this.price * 100) / 100
      } catch (e) {
        console.error(e, this.quantity, this.price)
        return null
      }
    },
  }
)

castingManager.registerModel('orderitem', OrderItem)

const Order = builder.newModelClass(
  {
    number: 'string',
    customer: 'string',
    date: 'date',
    items: 'orderitemcollection',
    total: 'decimal:2',
  },
  {},
  {
    _get_total: function () {
      try {
        return Math.round(this.items.sum('total') * 100) / 100
      } catch (e) {
        return null
      }
    },
  }
)

castingManager.registerModel('order', Order)

export default castingManager