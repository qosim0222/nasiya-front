import Logo from "../assets/images/logo.svg";

const LoadingPage = () => {
  return (
    <div className="containers">
      <div className="flex justify-center items-center w-full h-[100vh]">
        <img className="page-loading-img" src={Logo} alt="logo img" />
      </div>
    </div>
  );
};

export default LoadingPage;
