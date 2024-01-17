(ns guestbook.auth-z)

(defn identity->roles [identity]
  (cond-> #{:any}
    (some? identity) (conj :authenticated)))

(def roles
  {:message/create! #{:authenticated}
   :author/get #{:any}
   :account/set-profile! #{:authenticated}
   :auth/login #{:any}
   :auth/logout #{:any}
   :auth/register #{:any}
   :session/get #{:any}
   :messages/list #{:any}
   :swagger/swagger #{:any}})
