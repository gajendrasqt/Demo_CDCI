import { useTheme } from '@react-navigation/native';
import React, { useState } from "react";
import { Alert, Dimensions, Image, Text, TextInput, ToastAndroid, View } from 'react-native';
import * as Animatable from "react-native-animatable";
import deviceInfoModule from "react-native-device-info";
import Spinner from 'react-native-loading-spinner-overlay';
// import { TouchableRipple } from 'react-native-paper';
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen";
import { checklogindetails, isNetworkAvailable } from '~config/ApiServices';
import AppConst from '~config/AppConst';
import { getAppIcon, isShowSafeArea, recordError } from "~config/CommonFunctions";
import Fonts from "~config/Fonts";
import FontSizes from "~config/FontSizes";
import { storeChecklogindetailsRes } from '~config/LocalServices';
import { SvgImages } from "~config/SvgImages";
import style from './style';


const { width } = Dimensions.get('screen')


export default function ContentView(props) {

    const { colors } = useTheme()

    // ANCHOR : Handle State
    const [isLoading, setIsLoading] = useState(false)
    const [mobileNumber, setMobileNumber] = useState('')


    const signInWithPhoneNumber = () => {
        //Sign in with Phone number Using firebase
        if (mobileNumber.length == 0) {
            notifyMessage(AppConst.enterMobileNumber)
        } else {
            apichecklogindetails()
        }
    }

    const onChangeMobileNumber = (text) => {
        setMobileNumber(text)
    }

    const notifyMessage = (msg) => {
        setTimeout(() => {
            if (Platform.OS === 'android') {
                ToastAndroid.show(msg, ToastAndroid.SHORT)
            } else {
                Alert.alert(msg);
            }
        }, 300);
    }

    //ANCHOR API CALL 

    const apichecklogindetails = async () => {

        //REVIEW apichecklogindetails
        const isConnected = await isNetworkAvailable()
        if (isConnected) {
            setIsLoading(true)
            checklogindetails(
                mobileNumber,
                ""
            ).then(res => {
                setIsLoading(false)
                if (res.status_code == 1) {
                    // Save Offline Data for Verify OTP
                    storeChecklogindetailsRes(res.data)
                        .then(res => {
                            // Redirect to OTP Screen after Verify OTP
                            props.navigation.navigate("OTPView", { mobileNumber: mobileNumber })

                        }, error => {
                            recordError(error)
                            notifyMessage(error)
                        })
                } else {
                    notifyMessage(res.message)
                }
            }, error => {
                setIsLoading(false)
                recordError(error)
                notifyMessage(error)
            })
        } else {
            setIsLoading(false)
            notifyMessage("Please check internet connectivity")
        }
    }

    //ANCHOR Render Method 

    const renderMobileTextView = () => {
        return (
            <View
                style=
                {[
                    style.mobileView,
                    style.containerViewStyle,
                    style.containerViewStyleSecond,
                    {
                        backgroundColor: colors.container,
                        marginTop: Platform.OS == 'ios' ? isShowSafeArea() ? heightPercentageToDP('15%') : heightPercentageToDP('20%') : heightPercentageToDP('15%')
                    }
                ]}
            >
                {/* <Image source={Flag} style={style.flagStyle} /> */}
                <View style={style.flagStyle} >
                    <SvgImages.IndiaFlag
                        width={'100%'}
                        height={'100%'}
                    />
                </View>
                <Text
                    numberOfLines={2}
                    style={[style.numberTextStyle, { color: colors.text }]}
                >
                    +91
                </Text>
                <View style={[style.dividerStyle, { backgroundColor: colors.darkGray }]}></View>
                <TextInput
                    keyboardAppearance={colors.keyboardAppearance}
                    keyboardType='number-pad'
                    returnKeyType='done'
                    value={mobileNumber}
                    placeholder={'Mobile Number'}
                    allowFontScaling={false}
                    autoFocus={true}
                    onChangeText={onChangeMobileNumber}
                    placeholderTextColor={colors.placeholder}
                    style={[style.textInputStyle, { color: colors.textInput }]}>
                </TextInput>
            </View>
        )
    }


    const renderRenderContinueButton = () => {
        return (
            <TouchableRipple
                touchSoundDisabled={false}
                rippleColor="transparent"
            // onPress={signInWithPhoneNumber}
            >
                <View style={[style.mobileView, style.btnView, { backgroundColor: colors.btnColor }]}>
                    <Text style={[style.btnLabelStyle, { color: colors.text2 }]}>
                        CONTINUE
                    </Text>
                </View>
            </TouchableRipple>
        )
    }

    // ANCHOR : Main Render Method

    const path = getAppIcon(deviceInfoModule.getBundleId(), colors)
    return (
        <View style={[style.contentView]}>
            <Spinner visible={isLoading} />
            {(deviceInfoModule.getBundleId() != "com.edusunsoft.orataroerp" && deviceInfoModule.getBundleId() != "com.edusunsoft.erp.orataro") && <View style={{ width: width * 0.5, marginTop: Platform.OS == 'ios' ? isShowSafeArea() ? heightPercentageToDP('-20%') : heightPercentageToDP('-25%') : heightPercentageToDP('-20%'), alignSelf: 'center' }}>
                <Image resizeMode='contain' source={path} style={{ width: widthPercentageToDP(30), height: widthPercentageToDP(30), borderRadius: 0, alignSelf: 'center', padding: 10 }} />
                <Animatable.Text numberOfLines={2} animation={"rubberBand"} duration={2000} style={{ fontFamily: Fonts.customeBold, fontSize: FontSizes.size18, color: colors.btnColor, marginTop: 5, alignSelf: "center", textAlign: 'center' }}>{deviceInfoModule.getApplicationName()}</Animatable.Text>
            </View>}
            {
                renderMobileTextView()
            }
            {
                renderRenderContinueButton()
            }
        </View>
    );

}
