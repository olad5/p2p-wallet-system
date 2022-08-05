export interface PaystackInitRequest {
  email: string;
  amount: number;
  currency: "NGN";
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    amount: number;
    status: "success" | "abandoned" | "failed";
    reference: string;
  };
}
