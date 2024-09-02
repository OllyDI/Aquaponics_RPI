![아쿠팜 로고](https://github.com/user-attachments/assets/cfc13cf4-3388-42ab-b1dd-7f03241e38ce)
# Ⅰ. Aquaponics_RPI

 - 라즈베리파이 서버

 - 아두이노를 통한 데이터 수집

 - 수집한 데이터를 라즈베리파이 서버에서 가공 및 저장

 - 7인치 터치스크린을 통한 라즈베리파이 웹서버 가시화

 - 자세한 프로젝트 내용은 https://github.com/OllyDI/Aquaponics 레파지토리 참조

## Ⅱ. 프로젝트 설계

□ 데이터베이스 설계
    
 - 디바이스 - 기기명(PK), 기기이름, 와이파이이름, 와이파이 비밀번호, 서비스, 카메라
    
 - 제어 - 키(PK), LED, 모터, 기포, 기기, 사용자, 날짜
    
 - 환경정보 - 키(PK), 외부온도, 수온, 습도, 조도, 모터, 기포, LED, EC, pH, DO, 날짜

 - 센서 - 키(PK), 기기명, 모터, 기포, LED

□ 논리DB모델<br>
![아쿠팜_라즈 논리db모델](https://github.com/user-attachments/assets/e3188f29-4265-40a9-951d-3bbcb6ea76c0)

□ 물리DB모델<br>
 ![아쿠팜_라즈 물리db모델](https://github.com/user-attachments/assets/61c72ea6-b92d-4fcc-888e-2b8cd7d13bb6)
