import { EnvoyePar } from "@/types/common"

type Props = {
  envoyePar: EnvoyePar
}

const getEnvoyeParLabel = (envoyePar: EnvoyePar) => {
  switch (envoyePar) {
    case "ADMIN":
      return "Administration"
    case "CLIENT":
      return "Client"
    default:
      return "Inconnu"
  }
}

export default function EnvoyeParBadge({ envoyePar }: Props) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        envoyePar === "ADMIN"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {getEnvoyeParLabel(envoyePar)}
    </span>
  )
}