import { Amiri, Inter, Noto_Naskh_Arabic } from "next/font/google";

export const inter = Inter({ weight: "variable", subsets: ["latin"] });
export const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"] });
export const naskh = Noto_Naskh_Arabic({
  weight: "variable",
  subsets: ["arabic"],
});
