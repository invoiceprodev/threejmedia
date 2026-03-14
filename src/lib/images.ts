import localLogo from "../../images/threejmedia_logo.png";
import localPortfolioOne from "../../images/portfolio-1.png";
import localPortfolioTwo from "../../images/portfolio-2.png";
import localPortfolioThree from "../../images/portfolio-3.png";
import localPortfolioFour from "../../images/portfolio-4.png";
import localPortfolioFive from "../../images/portfolio-5.png";
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
