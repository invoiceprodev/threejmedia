import localLogo from "../../images/threejmedia_logo.png";
import localPortfolioOne from "../../images/portfolio-1.png";
import localPortfolioTwo from "../../images/portfolio-2.png";
import localPortfolioThree from "../../images/portfolio-3.png";
import localPortfolioFour from "../../images/portfolio-4.png";
import localPortfolioFive from "../../images/portfolio-5.png";
import { env } from "./env";

const cloudinaryAssetUrls = {
  logo: "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773489792/threejmedia_logo.png",
  portfolioOne: "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773489824/portfolio-1.png",
  portfolioTwo: "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773489837/portfolio-2.png",
  portfolioThree: "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773489852/portfolio-3.png",
  portfolioFour: "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773489866/portfolio-4.png",
  portfolioFive: "https://res.cloudinary.com/dwqrz9shj/image/upload/v1773489877/portfolio-1-2.png",
};

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
  logo: env.cloudinary.cloudName ? cloudinaryAssetUrls.logo : resolveHostedImage("threejmedia_logo.png", localLogo),
  portfolioOne: env.cloudinary.cloudName
    ? cloudinaryAssetUrls.portfolioOne
    : resolveHostedImage("portfolio-1.png", localPortfolioOne),
  portfolioTwo: env.cloudinary.cloudName
    ? cloudinaryAssetUrls.portfolioTwo
    : resolveHostedImage("portfolio-2.png", localPortfolioTwo),
  portfolioThree: env.cloudinary.cloudName
    ? cloudinaryAssetUrls.portfolioThree
    : resolveHostedImage("portfolio-3.png", localPortfolioThree),
  portfolioFour: env.cloudinary.cloudName
    ? cloudinaryAssetUrls.portfolioFour
    : resolveHostedImage("portfolio-4.png", localPortfolioFour),
  portfolioFive: env.cloudinary.cloudName
    ? cloudinaryAssetUrls.portfolioFive
    : resolveHostedImage("portfolio-5.png", localPortfolioFive),
};
