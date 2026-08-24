export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido."
    });
  }

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Nenhum ingresso informado."
      });
    }

    const preferenceItems = items.map((item) => ({
      title: item.title,
      quantity: Number(item.quantity),
      currency_id: "BRL",
      unit_price: Number(item.unit_price)
    }));

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: preferenceItems,
          payment_methods: {
            installments: 10
          },
          back_urls: {
            success: "https://carnafer-2026.vercel.app",
            failure: "https://carnafer-2026.vercel.app",
            pending: "https://carnafer-2026.vercel.app"
          },
          auto_return: "approved"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Erro ao criar pagamento.",
        details: data
      });
    }

    return res.status(200).json({
      init_point: data.init_point,
      preference_id: data.id
    });

  } catch (error) {
    console.error("Erro Mercado Pago:", error);

    return res.status(500).json({
      error: "Erro ao conectar com o pagamento."
    });
  }
}
