import { ConfigProvider } from "antd";
import BotComponent from "./components/Bot";
import RoutesStack from "./routes";

const App = () => (
  <ConfigProvider
    theme={{
      components: {
        Slider: {
          handleColor: "#6d9755",
          handleActiveColor: "#6d9755",
        },
        Segmented: {
          itemSelectedBg: "#0a3e35",
          itemSelectedColor: "#FFF",
        },
        Tabs: {
          inkBarColor: "#0a3e35",
          itemSelectedColor: "#0a3e35",
          itemHoverColor: "#0a3e35",
        },
        Input: {
          colorPrimary: "#6d9755",
          hoverBorderColor: "#6d9755",
        },
        Checkbox: {
          colorPrimary: "#6d9755",
          colorPrimaryHover: "#6d9755",
        },
        Switch: {
          colorPrimary: "#6d9755",
        },
        Radio: {
          colorPrimary: "#6d9755",
        },
      },
    }}
  >
    <RoutesStack />
    <BotComponent />
  </ConfigProvider>
);

export default App;
