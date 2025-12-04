import logoImage from '@assets/generated_images/lumina_ai_logo.png';
import watchImage from '@assets/generated_images/smart_watch_product.png';
import droneImage from '@assets/generated_images/ai_drone_product.png';
import headsetImage from '@assets/generated_images/neural_headset_product.png';

export const assets = {
  logo: logoImage,
};

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  aiAnalysis: {
    sentiment: string;
    keywords: string[];
    prediction: string;
  };
}

export const products: Product[] = [
  {
    id: 1,
    title: "Chronos AI Smartwatch",
    price: 299,
    image: watchImage,
    category: "Taqiladigan Qurilmalar",
    aiAnalysis: {
      sentiment: "Ijobiy (98%)",
      keywords: ["biometrik", "golografik", "titan"],
      prediction: "4-chorakda yuqori talab kutilmoqda",
    },
  },
  {
    id: 2,
    title: "AeroSentinel Droni",
    price: 899,
    image: droneImage,
    category: "Robototexnika",
    aiAnalysis: {
      sentiment: "Neytral (85%)",
      keywords: ["avtonom", "kuzatuv", "4k"],
      prediction: "Korporativ sektorda barqaror o'sish",
    },
  },
  {
    id: 3,
    title: "NeuroLink Interfeysi",
    price: 1499,
    image: headsetImage,
    category: "Tibbiyot",
    aiAnalysis: {
      sentiment: "Hayajonli (92%)",
      keywords: ["bci", "neyron", "eksperimental"],
      prediction: "Inqilobiy salohiyat",
    },
  },
  {
    id: 4,
    title: "Kvant Ma'lumotlar Markazi",
    price: 4500,
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80",
    category: "Hisoblash Tizimlari",
    aiAnalysis: {
      sentiment: "Ijobiy (95%)",
      keywords: ["kvant", "qayta ishlash", "server"],
      prediction: "Cheklangan zaxira ogohlantirishi",
    },
  },
  {
    id: 5,
    title: "Holo-Displey V2",
    price: 699,
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
    category: "Ekranlar",
    aiAnalysis: {
      sentiment: "Ijobiy (88%)",
      keywords: ["gologramma", "3d", "interaktiv"],
      prediction: "O'yin sektorida trendda",
    },
  },
];
