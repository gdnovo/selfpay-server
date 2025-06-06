const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/pix', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, amount } = req.body;

    const transactionData = {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      },
      paymentMethod: 'pix',
      items: items.map(item => ({
        title: item.name,
        unitPrice: item.price,
        quantity: item.quantity,
        externalRef: item.externalRef || 'PRODUTO0001'
      })),
      amount: amount
    };

    const secretKey = process.env.SELFPAY_SECRET_KEY || 'sk_live_CjbWEf9j7Y8YDwSmfrJb3WrQfuUhMmZqzuV3qkoPyDL1TjPK';
    const companyId = process.env.SELFPAY_COMPANY_ID || '0b06217c-c4a0-46b0-9d38-d95120e415dd';
    const credentials = `${secretKey}:${companyId}`;
    const encodedAuth = Buffer.from(credentials).toString('base64');

    const response = await fetch('https://api.selfpaybr.com/functions/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedAuth}`
      },
      body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.message || 'Erro ao criar transação PIX' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro ao processar pagamento PIX:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
