import "./index.css";
import { Composition } from "remotion";
import { MdPageDemo } from "./MdPageDemo";
import { TelegramDemo } from "./TelegramDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MdPageDemo"
        component={MdPageDemo}
        durationInFrames={490}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="TelegramDemo"
        component={TelegramDemo}
        durationInFrames={430}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
