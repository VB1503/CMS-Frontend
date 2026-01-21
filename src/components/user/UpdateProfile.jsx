import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaUser, FaExclamationCircle, FaLock, FaPhone, FaShieldAlt } from 'react-icons/fa';
import { AiOutlineSetting, AiOutlineDelete, AiOutlineUpload } from 'react-icons/ai';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProfileUpdate.css';

const ProfileUpdate = () => {
  // ==================== State Management ====================
  const [image, setImage] = useState("");
  const [otp, setOtp] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [Phone, setPhone] = useState(localStorage.getItem('phone_number'));
  const [errors, setErrors] = useState({ email: "", phone_number: "" });
  const [userData, setUserData] = useState({ email: '', first_name: '', last_name: '' });

  // ==================== Local Storage Values ====================
  const is_verified = localStorage.getItem('is_verified');
  const first_name = localStorage.getItem('first_name');
  const last_name = localStorage.getItem('last_name');
  const phone_number = localStorage.getItem('phone_number');
  const email = localStorage.getItem('email');
  const [profile, setProfile] = useState(localStorage.getItem('profile_pic'));
  const isAuthenticated = localStorage.getItem('token');

  // ==================== API & Navigation ====================
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE;

  // ==================== Authentication Check ====================
  
  useEffect(() => {
    if (!isAuthenticated) {
       navigate("/", {
          state: {
            showLoginModal: true,
          },
          replace: true,
        });
    }
  }, [isAuthenticated, navigate]);

  // ==================== Initialize User Data ====================
  useEffect(() => {
    setPhone(phone_number);
    setUserData({ email, first_name, last_name });
  }, [email, first_name, last_name, phone_number]);

  // ==================== Upload Effect ====================
  useEffect(() => {
    if (uploaded) {
      handleProfileSubmit();
    }
  }, [uploaded]);

  // ==================== Delete Account Handler ====================
  const handleDeleteConfirmation = async () => {
    setShowDeleteModal(false);
    try {
      const userId = localStorage.getItem('userid');
      const res = await axios.delete(
        `${API_BASE_URL}/api/v1/auth/update-user/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
          },
        }
      );

      if (res.status === 204) {
        localStorage.clear();
        navigate('/register');
        window.location.reload(true);
      }
    } catch (error) {
      toast.error('An error occurred while deleting profile');
    }
  };

  // ==================== Change Password Handler ====================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/changePassword/`, { 'email': email });
        if (res.status === 200) {
          const response = res.data;
          const uid = response['uidb64'];
          const token = response['token'];
          navigate("/user/changepassword/", {
              state: {
                uid,
                token,
              },
            });
        }
      } catch (error) {
        toast.error('Error initiating password reset');
      }
    }
  };

  // ==================== Phone Input Handler ====================
  const handleOnchangePh = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (phone_number) {
      const isValid = /^\d{10}$/.test(value);
      setErrors({ ...errors, phone_number: isValid ? '' : 'Phone Number must be 10 digits' });
    }
  };

  // ==================== Form Input Handler ====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
    if (name === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setErrors({ ...errors, email: isValid ? '' : 'Invalid email format' });
    }
  };

  // ==================== Remove Profile Image ====================
  const RemoveImage = () => {
    const defaultImage = 'https://cdn-icons-png.flaticon.com/128/149/149071.png';
    localStorage.setItem('profile_pic', defaultImage);
    setProfile(defaultImage);
    handleProfileSubmit();
  };

  // ==================== Image Resizing Function ====================
  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type);
      };
    });
  };

  // ==================== Image Upload Handler ====================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Resize image if needed
    const resizedImage = await resizeImage(file, 800, 800);
    setImage(resizedImage);
  };

  // ==================== Upload Image to Cloudinary ====================
  const uploadImage = () => {
    if (!image) {
      toast.error('No image selected');
      return;
    }

    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "jvvslzla");
    data.append("cloud_name", "dybwn1q6h");

    fetch("https://api.cloudinary.com/v1_1/dybwn1q6h/image/upload", {
      method: "post",
      body: data
    })
    .then(resp => resp.json())
    .then(data => {
      setProfile(data.url);
      setUploaded(true);
      localStorage.setItem('profile_pic', data.url);
      toast.success('Image uploaded successfully');
    })
    .catch(err => {
      console.error("Error in uploading image:", err);
      toast.error('Error uploading image');
    });
  };

  // ==================== Update Profile Picture ====================
  const handleProfileSubmit = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/auth/update-user/${userId}/`,
        { 'profile_pic': profile },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
          },
        }
      );

      if (res.status === 200) {
        setImage("");
        setUploaded(false);
        toast.success('Profile picture updated');
      }
    } catch (error) {
      toast.error('Error updating profile picture');
    }
  };

  // ==================== Update User Information ====================
  const handleUpdateSubmit = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/auth/update-user/${userId}/`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
          },
        }
      );

      if (res.status === 200) {
        localStorage.setItem('email', userData.email);
        localStorage.setItem('first_name', userData.first_name);
        localStorage.setItem('last_name', userData.last_name);
        toast.success('Profile updated successfully');
        window.location.reload(true);
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  // ==================== Change Phone Number ====================
  const handlePhoneChange = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/phoneNumber/`,
        { 'user': parseInt(userId, 10), "phone_number": Phone },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
          },
        }
      );

      if (res.status === 200) {
        setOtp(true);
        localStorage.setItem('phone_number', Phone);
        localStorage.setItem('is_verified', false);
        toast.success('OTP sent to verify phone number');
        navigate('/otp/verify', { state: { requestFrom: 'settings' } });
      }
    } catch (error) {
      setErrors({ ...errors, phone_number: 'This phone number is already taken' });
      toast.error('Error updating phone number');
    }
  };

  // ==================== Render Component ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
              <FaUser className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Account Settings</h1>
          </div>
          <p className="text-gray-600 ml-16">Manage your profile, security, and account preferences</p>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaUser className="text-emerald-500" /> Profile Information
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={profile || 'https://cdn-icons-png.flaticon.com/128/149/149071.png'}
                  alt="Profile"
                  onClick={() => setShowProfileModal(true)}
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg cursor-pointer transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center cursor-pointer" onClick={() => setShowProfileModal(true)}>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-semibold">View</span>
                </div>
                <label
                  htmlFor="file-upload-input"
                  className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 p-3 rounded-full cursor-pointer text-white shadow-lg transition-all"
                >
                  <FaEdit className="text-lg" />
                </label>
                <input
                  type="file"
                  id="file-upload-input"
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {/* Image Preview */}
              {image && (
                <div className="w-full">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-32 h-32 rounded-lg object-cover border-2 border-teal-300"
                  />
                  <div className="flex gap-2 mt-3 w-full">
                    <button
                      onClick={uploadImage}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <AiOutlineUpload /> Upload
                    </button>
                  </div>
                </div>
              )}

              {!image && (
                <button
                  onClick={RemoveImage}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <AiOutlineDelete /> Remove
                </button>
              )}
            </div>

            {/* User Info Section */}
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{first_name} {last_name}</h3>
                <p className="text-gray-600">{email}</p>
              </div>

              {/* Phone Status */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-teal-500 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-800">{phone_number || 'Not added'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {is_verified === 'true' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ✗ Not Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Information Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <AiOutlineSetting className="text-emerald-500" /> Edit Information
              </h2>

              {/* Email Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* First Name Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={userData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Last Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={userData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Update Button */}
              <button
                onClick={handleUpdateSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Phone Number Card */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPhone className="text-teal-500" /> Phone Number
              </h3>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {phone_number ? 'Change Phone' : 'Add Phone Number'}
              </label>
              <input
                type="text"
                value={Phone}
                onChange={handleOnchangePh}
                placeholder="Enter 10-digit phone"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-all mb-3"
              />
              {errors.phone_number && <p className="text-red-500 text-sm mb-3">{errors.phone_number}</p>}

              <button
                onClick={handlePhoneChange}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition-all"
              >
                {phone_number ? 'Update' : 'Add'} Phone
              </button>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaShieldAlt className="text-amber-500" /> Security & Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Change Password Button */}
            <button
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <FaLock className="text-lg" /> Change Password
            </button>

            {/* Delete Account Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <AiOutlineDelete className="text-lg" /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex justify-center mb-4">
              <FaExclamationCircle className="text-5xl text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Delete Account?</h2>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. All your data, profile information, and associated content will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmation}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Popup Modal */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Profile Picture</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Image Content */}
            <div className="p-8 flex flex-col items-center">
              <img
                src={profile || 'https://cdn-icons-png.flaticon.com/128/149/149071.png'}
                alt="Profile"
                className="max-w-sm w-full h-auto rounded-xl object-cover shadow-xl border-4 border-emerald-200"
              />
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm mb-4">{first_name} {last_name}</p>
                <p className="text-gray-500 text-xs">{email}</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={RemoveImage}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <AiOutlineDelete /> Remove
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileUpdate;
