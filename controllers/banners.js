const { Banners } = require("../models");
const { fetch_user } = require("../helpers");

const fetch_banner = async (req, res) => {
  try {
    const token = await fetch_user(req.headers.authorization.split(" ")[1]);
    const fetch_banner = await Banners.findAll({
      where: { status: 1 },
    });

    const modifu_data = fetch_banner.map((banner) => {
      return {
        image: banner.image,
        type: banner.banner_type,
        // offer: {
        //     status : banner.banner_type === 1 ? banner.status : false
        // }
      };
    });

    res.status(200).json({
      status: true,
      message: "banner fetched successfully",
      data: {
        version: 0,
        download_url: "",
        banner: modifu_data,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
      data: {},
    });
  }
};

module.exports = {
  fetch_banner,
};
