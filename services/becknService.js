const BecknTransactionLog = require('../models/BecknTransactionLog');
const Issuer = require('../models/Issuer');
const { v4: uuidv4 } = require('uuid');

class BecknService {
  createContext(action, transactionId = null, messageId = null) {
    return {
      domain: 'skill-verification:1.0.0',
      action: action,
      version: '1.1.0',
      bap_id: 'skill-verification-bap',
      bap_uri: process.env.BAP_URI || 'http://localhost:5000/api/beckn',
      transaction_id: transactionId || uuidv4(),
      message_id: messageId || uuidv4(),
      timestamp: new Date().toISOString(),
      ttl: 'PT30M'
    };
  }

  async search(intent) {
    const context = this.createContext('search');
    
    const searchPayload = {
      context,
      message: {
        intent: {
          item: {
            descriptor: {
              name: intent.skillName || ''
            }
          },
          provider: {
            descriptor: {
              name: intent.issuerName || ''
            }
          },
          category: {
            descriptor: {
              code: intent.category || 'skill-verification'
            }
          }
        }
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'search', 'BAP', searchPayload, null, 'initiated');

    const issuers = await Issuer.find({ isActive: true });
    
    const onSearchPayload = {
      context: { ...context, action: 'on_search' },
      message: {
        catalog: {
          providers: issuers.map(issuer => ({
            id: issuer._id.toString(),
            descriptor: {
              name: issuer.name,
              short_desc: issuer.metadata?.description || ''
            },
            categories: [{
              id: issuer.type,
              descriptor: { name: issuer.type }
            }],
            items: [{
              id: `${issuer._id}-verification`,
              descriptor: {
                name: 'Skill Verification Service',
                short_desc: `Verification service by ${issuer.name}`
              },
              category_ids: [issuer.type],
              fulfillment_ids: ['1'],
              price: {
                currency: 'INR',
                value: '0'
              }
            }],
            fulfillments: [{
              id: '1',
              type: 'DIGITAL',
              state: {
                descriptor: { name: 'Available' }
              }
            }]
          }))
        }
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'on_search', 'BPP', searchPayload, onSearchPayload, 'completed');

    return onSearchPayload;
  }

  async select(providerId, itemId) {
    const context = this.createContext('select');
    
    const selectPayload = {
      context,
      message: {
        order: {
          provider: { id: providerId },
          items: [{ id: itemId }]
        }
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'select', 'BAP', selectPayload, null, 'initiated');

    const issuer = await Issuer.findById(providerId);
    
    const onSelectPayload = {
      context: { ...context, action: 'on_select' },
      message: {
        order: {
          provider: {
            id: providerId,
            descriptor: { name: issuer.name }
          },
          items: [{
            id: itemId,
            descriptor: { name: 'Skill Verification Service' },
            price: { currency: 'INR', value: '0' }
          }],
          quote: {
            price: { currency: 'INR', value: '0' },
            breakup: [{
              title: 'Base Price',
              price: { currency: 'INR', value: '0' }
            }]
          }
        }
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'on_select', 'BPP', selectPayload, onSelectPayload, 'completed');

    return onSelectPayload;
  }

  async confirm(order) {
    const context = this.createContext('confirm');
    
    const confirmPayload = {
      context,
      message: { order }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'confirm', 'BAP', confirmPayload, null, 'initiated');

    const onConfirmPayload = {
      context: { ...context, action: 'on_confirm' },
      message: {
        order: {
          ...order,
          id: uuidv4(),
          state: 'ACTIVE',
          fulfillments: [{
            id: '1',
            type: 'DIGITAL',
            state: {
              descriptor: { name: 'Confirmed' }
            },
            tracking: false
          }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'on_confirm', 'BPP', confirmPayload, onConfirmPayload, 'completed');

    return onConfirmPayload;
  }

  async status(orderId) {
    const context = this.createContext('status');
    
    const statusPayload = {
      context,
      message: {
        order_id: orderId
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'status', 'BAP', statusPayload, null, 'initiated');

    const onStatusPayload = {
      context: { ...context, action: 'on_status' },
      message: {
        order: {
          id: orderId,
          state: 'COMPLETED',
          fulfillments: [{
            id: '1',
            state: {
              descriptor: { name: 'Completed' }
            }
          }],
          updated_at: new Date().toISOString()
        }
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'on_status', 'BPP', statusPayload, onStatusPayload, 'completed');

    return onStatusPayload;
  }

  async support(orderId) {
    const context = this.createContext('support');
    
    const supportPayload = {
      context,
      message: {
        ref_id: orderId
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'support', 'BAP', supportPayload, null, 'initiated');

    const onSupportPayload = {
      context: { ...context, action: 'on_support' },
      message: {
        support: {
          ref_id: orderId,
          phone: '+91-1800-XXX-XXXX',
          email: 'support@skill-verification.network',
          url: 'https://skill-verification.network/support'
        }
      }
    };

    await this.logTransaction(context.transaction_id, context.message_id, 'on_support', 'BPP', supportPayload, onSupportPayload, 'completed');

    return onSupportPayload;
  }

  async logTransaction(transactionId, messageId, action, role, requestPayload, responsePayload, status) {
    await BecknTransactionLog.create({
      transactionId,
      messageId,
      action,
      role,
      requestPayload,
      responsePayload,
      status,
      timestamp: new Date()
    });
  }
}

module.exports = new BecknService();
