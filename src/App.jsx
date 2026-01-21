import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import {ToastContainer} from 'react-toastify'
import Header from './components/nav/Header';
import SocialAuth from './pages/social-auth/SocialAuth'
import 'react-toastify/dist/ReactToastify.css';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgetPassword from './pages/auth/ForgetPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProfileUpdate from './components/user/UpdateProfile';
import UserLandsDisplay from './pages/UserLandDisplay';
import PredictionHistory from './pages/PredictionHistory';
import MapComponent from './components/Map/MapDrawer';
import CropRecommendationForm from "./pages/CropRecommendation"
import CropYieldPredictionForm from './pages/CropYield';
import IrrigationSystem from './pages/Irrigation';
import FertilizerRecommendationForm from './pages/fertilizers';
import FertilizerRecommendationResult from './pages/FertilizerRes';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Header />}>
      <Route index element={<Home />} />
      <Route path="/google" element={<SocialAuth />} />
      <Route path="/otp/verify" element={<VerifyOtp />} />
      <Route path="/LSM" element={<MapComponent />} />
      <Route path="/crs" element={<CropRecommendationForm />} />
      <Route path="/irrigation" element={<IrrigationSystem />} />
      <Route path="/fertilizer" element={<FertilizerRecommendationForm />} />
      <Route path="/mylands" element={<UserLandsDisplay />} />
      <Route path="/predictions" element={<PredictionHistory />} />
      <Route path="/fertilizerres" element={<FertilizerRecommendationResult />} />
      <Route path="/cys" element={<CropYieldPredictionForm />} />
      <Route path="/user/settings" element={<ProfileUpdate />} />
      <Route path="/user" element={<UserProfile />} />
      <Route path='/forget_password' element={<ForgetPassword />} />
      <Route path='/user/changepassword/' element={<ResetPassword />} />
      <Route path='/resetpassword/:uid/:token' element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
)

function App() {

  return (
    <>
    <ToastContainer />
      <RouterProvider router={router}/>

    </>
  );
}

export default App;