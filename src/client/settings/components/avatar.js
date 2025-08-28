import { Image } from "@forge/react";
import React from "react";

const Avatar = ({ src }) => {
  return <Image src={src} alt="avatar" width={24} />;
};

export default Avatar;
