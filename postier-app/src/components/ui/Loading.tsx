interface LoadingProps {
  isLoading: boolean
}

export const Loading = ({ isLoading }: LoadingProps) => {
  if (!isLoading) return null;
  return (
    <div style={{width: "100%", height: "100%"}}>
      <div style={{display: "flex", flexDirection: "column", marginTop: 5}}>
        <span className="blink" style={{height: 22, width: 12, backgroundColor: "white"}}></span>
      </div>
    </div>
  )
}
