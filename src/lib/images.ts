import localLogo from "../../images/threejmedia_logo.png";
import localPortfolioOne from "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773484997/portfolio-1_jfp22y.png";
import localPortfolioTwo from "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773484998/portfolio-3_nzavw4.png";
import localPortfolioThree from "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773484999/portfolio-4_fje6jy.png";
import localPortfolioFour from "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773484997/portfolio-2_zq1nyk.png";
import localPortfolioFive from "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773485000/portfolio-5_tminef.png";
import { env } from "./env";

function getCloudinaryBaseUrl() {
  if (!env.cloudinary.cloudName) {
    return "";
  }

  const folderPath = env.cloudinary.folder ? `${env.cloudinary.folder}/` : "";
  return `https://res.cloudinary.com/${env.cloudinary.cloudName}/image/upload/f_auto,q_auto/${folderPath}`;
}

function resolveHostedImage(filename: string, fallback: string) {
  if (env.imageBaseUrl) {
    return `${env.imageBaseUrl}/${filename}`;
  }

  const cloudinaryBaseUrl = getCloudinaryBaseUrl();

  if (cloudinaryBaseUrl) {
    return `${cloudinaryBaseUrl}${filename}`;
  }

  return fallback;
}

export const imageAssets = {
  logo: resolveHostedImage("threejmedia_logo.png", localLogo),
  portfolioOne: resolveHostedImage("portfolio-1.png", localPortfolioOne),
  portfolioTwo: resolveHostedImage("portfolio-2.png", localPortfolioTwo),
  portfolioThree: resolveHostedImage("portfolio-3.png", localPortfolioThree),
  portfolioFour: resolveHostedImage("portfolio-4.png", localPortfolioFour),
  portfolioFive: resolveHostedImage("portfolio-5.png", localPortfolioFive),
};
