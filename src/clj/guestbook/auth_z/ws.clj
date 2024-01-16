(ns guestbook.auth-z.ws
  (:require
   [guestbook.auth-z :as auth-z]))

(defn authorized? [roles-by-id msg]
  (boolean
   (some (roles-by-id (:id msg) #{})
         (-> msg
             :session
             :identity
             (auth-z/identity->roles)))))
