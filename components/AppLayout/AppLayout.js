// 페이지에 공통 적용하는 레이아웃

export const AppLayout = ({ children }) => {
    return (
        <div>
            app layout!!
            <div>
                {children}
            </div>
        </div>
    )
}