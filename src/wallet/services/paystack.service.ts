import axios from "axios";
import debug from "debug";
import {
  PaystackInitRequest,
  PaystackInitResponse,
  PaystackVerifyResponse,
} from "../types/paystack.interface";

const log = debug("app: paystack-service");

class PaystackService {
  secretKey = `Bearer ${process.env.PAYSTACK_SECRET}`;

  async initializePayment(request: PaystackInitRequest) {
    try {
      let url = "https://api.paystack.co/transaction/initialize";
      let config = {
        headers: {
          authorization: this.secretKey,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      };

      const axiosResponse = await axios.post(url, request, config);
      const response: PaystackInitResponse = axiosResponse.data;
      return response;
    } catch (error: unknown) {
      log(error);
    }
  }

  async verifyPayment(reference: string) {
    try {
      let url =
        "https://api.paystack.co/transaction/verify/" +
        encodeURIComponent(reference);

      let config = {
        headers: {
          authorization: this.secretKey,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      };

      const axiosResponse = await axios.get(url, config);
      const response: PaystackVerifyResponse = axiosResponse.data;
      return response;
    } catch (error) {
      log(error);
    }
  }
}

export default new PaystackService();
