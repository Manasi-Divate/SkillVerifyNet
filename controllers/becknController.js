const becknService = require('../services/becknService');

exports.search = async (req, res) => {
  try {
    const { intent } = req.body;
    
    const response = await becknService.search(intent);
    
    res.json({
      message: {
        ack: {
          status: 'ACK'
        }
      }
    });

    setTimeout(() => {
      console.log('on_search callback would be sent to:', req.body.context?.bap_uri);
    }, 100);
  } catch (error) {
    console.error('Beckn search error:', error);
    res.status(500).json({ 
      message: {
        ack: {
          status: 'NACK'
        }
      },
      error: error.message 
    });
  }
};

exports.onSearch = async (req, res) => {
  try {
    const { intent } = req.body;
    const response = await becknService.search(intent);
    res.json(response);
  } catch (error) {
    console.error('Beckn on_search error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.select = async (req, res) => {
  try {
    const { order } = req.body;
    const { provider, items } = order;
    
    const response = await becknService.select(provider.id, items[0].id);
    
    res.json({
      message: {
        ack: {
          status: 'ACK'
        }
      }
    });
  } catch (error) {
    console.error('Beckn select error:', error);
    res.status(500).json({ 
      message: {
        ack: {
          status: 'NACK'
        }
      },
      error: error.message 
    });
  }
};

exports.onSelect = async (req, res) => {
  try {
    const { order } = req.body;
    const { provider, items } = order;
    const response = await becknService.select(provider.id, items[0].id);
    res.json(response);
  } catch (error) {
    console.error('Beckn on_select error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.confirm = async (req, res) => {
  try {
    const { order } = req.body;
    
    const response = await becknService.confirm(order);
    
    res.json({
      message: {
        ack: {
          status: 'ACK'
        }
      }
    });
  } catch (error) {
    console.error('Beckn confirm error:', error);
    res.status(500).json({ 
      message: {
        ack: {
          status: 'NACK'
        }
      },
      error: error.message 
    });
  }
};

exports.onConfirm = async (req, res) => {
  try {
    const { order } = req.body;
    const response = await becknService.confirm(order);
    res.json(response);
  } catch (error) {
    console.error('Beckn on_confirm error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.status = async (req, res) => {
  try {
    const { order_id } = req.body;
    
    const response = await becknService.status(order_id);
    
    res.json({
      message: {
        ack: {
          status: 'ACK'
        }
      }
    });
  } catch (error) {
    console.error('Beckn status error:', error);
    res.status(500).json({ 
      message: {
        ack: {
          status: 'NACK'
        }
      },
      error: error.message 
    });
  }
};

exports.onStatus = async (req, res) => {
  try {
    const { order_id } = req.body;
    const response = await becknService.status(order_id);
    res.json(response);
  } catch (error) {
    console.error('Beckn on_status error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.support = async (req, res) => {
  try {
    const { ref_id } = req.body;
    
    const response = await becknService.support(ref_id);
    
    res.json({
      message: {
        ack: {
          status: 'ACK'
        }
      }
    });
  } catch (error) {
    console.error('Beckn support error:', error);
    res.status(500).json({ 
      message: {
        ack: {
          status: 'NACK'
        }
      },
      error: error.message 
    });
  }
};

exports.onSupport = async (req, res) => {
  try {
    const { ref_id } = req.body;
    const response = await becknService.support(ref_id);
    res.json(response);
  } catch (error) {
    console.error('Beckn on_support error:', error);
    res.status(500).json({ error: error.message });
  }
};
