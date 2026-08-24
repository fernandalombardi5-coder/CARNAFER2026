export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido."
    });
  }

  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        erro: "MERCADOPAGO_ACCESS_TOKEN não configurado."
      });
    }

    const { itens } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "Nenhum ingresso informado."
      });
    }

    const items = itens.map((item) => ({
      title: item.titulo,
      quantity: Number(item.quantidade),
      currency_id: "BRL",
      unit_price: Number(item.preco_unitario)
    }));

    const resposta = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          items,

          payment_methods: {
            installments: 10
          },

          back_urls: {
            success: "https://carnafer-2026.vercel.app/sucesso",
            failure: "https://carnafer-2026.vercel.app/erro",
            pending: "https://carnafer-2026.vercel.app/pendente"
          },

          auto_return: "approved"
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro Mercado Pago:", dados);

      return res.status(resposta.status).json({
        erro: dados.message || "Erro ao criar pagamento.",
        detalhes: dados
      });
    }

    return res.status(200).json({
      ponto_inicial: dados.init_point,
      init_point: dados.init_point,
      id_de_preferencia: dados.id
    });

  } catch (erro) {
    console.error("Erro Mercado Pago:", erro);

    return res.status(500).json({
      erro: "Erro ao conectar com o pagamento.",
      detalhes: erro.message
    });
  }
}
