import styled from "styled-components";

// Used for wrapping a page component
export const Screen = styled.div`
  background-color: var(--black);
  background-image: ${({ image }) => (image ? `url(${image})` : "none")};
  background-size: cover;
  background-position: center;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// Used for providing space between components
export const SpacerXSmall = styled.div`
  height: 8px;
  width: 8px;
`;

// Used for providing space between components
export const SpacerSmall = styled.div`
  height: 16px;
  width: 16px;
`;

// Used for providing space between components
export const SpacerMedium = styled.div`
  height: 24px;
  width: 24px;
`;

// Used for providing space between components
export const SpacerLarge = styled.div`
  height: 32px;
  width: 32px;
`;

// Used for providing space between components
export const SpacerXLarge = styled.div`
  height: 48px;
  width: 48px;
`;

// Used for providing space between components
export const SpacerXXLarge = styled.div`
  height: 64px;
  width: 64px;
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  min-height: 100vh;
  background-color: var(--black);
`;

// Used for providing a wrapper around a component
export const Container = styled.div`
  display: flex;
  flex: ${({ flex }) => (flex ? flex : 0)};
  flex-direction: ${({ fd }) => (fd ? fd : "column")};
  justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
  align-items: ${({ ai }) => (ai ? ai : "flex-start")};
  background-color: ${({ test }) => (test ? "pink" : "none")};
  width: 100%;
  background-image: ${({ image }) => (image ? `url(${image})` : "none")};
  background-size: cover;
  background-position: center;
`;

export const ClockContainer = styled.div`
  rotateSecond: ${({ ra }) => (ra ? ra : 0)}
`;

export const TextPageTitle = styled.p`
  color: var(--white);
  font-size: 48px;
  font-weight: 500;
  font-family: default-font;
  line-height: 1.6;
`;

export const TextTitle = styled.p`
  color: var(--white);
  font-size: 34px;
  font-weight: 500;
  font-family: default-font;
  line-height: 1.6;
`;

export const TextSubTitle = styled.p`
  color: var(--white);
  font-size: 26px;
  font-weight: bold;
  line-height: 1.6;
  font-family: default-font;
`;

export const TextDescription = styled.p`
  color: var(--white);
  font-size: 14px;
  line-height: 1.6;
  font-family: default-font;
`;

export const TextParagraph = styled.p`
  color: var(--white);
  font-size: 18px;
  line-height: 1.6;
`;

export const StyledClickable = styled.div`
  :active {
    opacity: 0.6;
  }
`;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: ${({ bc }) => (bc ? bc : "#ffffff")};
  font-weight: bold;
  color: ${({ color }) => (color ? color : "#000000")}};
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const HelpButton = styled.button`
  border-radius: 20px;
  border: none;
  background-color: #ffffff;
  font-weight: bold;
  font-size: 20px;
  color: #000000;
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const Identicon = styled.img`
  width: 40px;
  height: 40px;
  transition: width 0.5s;
  transition: height 0.5s;
  border-radius: 20px;
`;

export const InputContainer = styled.input`
  display: flex;
  padding: 10px;
  width: 25vw;
  font-weight: bold;
  font-size: 18px;
  justify-content: flex-start;
  align-items: center;
  border-style: solid;
  border-width: 3px;
  border-color: black;
  border-radius: 10px;
  color: black;
`;