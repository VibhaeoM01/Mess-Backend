
export const PaymentIntent=async(req,res)=>{
    try{
        const {amount}=req.body;
        const paymentIntent=await Stripe.paymentIntents.create({
            amount,
            currency:"inr",
        });
          res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default router;